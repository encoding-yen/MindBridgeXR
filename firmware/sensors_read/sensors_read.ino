#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_QMC5883P.h>
#include <math.h>

#define SDA_PIN 8
#define SCL_PIN 9
#define MPU6050_ADDR 0x68

const char* ssid = "QSTP VC";
const char* password = "qstp1234";

const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "stingray/imu/data";

WiFiClient espClient;
PubSubClient client(espClient);

Adafruit_QMC5883P qmc;

// Magnetometer hard-iron offsets (X/Y/Z). Re-run calibration if you move to a
// new location or change nearby ferrous/magnetic components.
float offsetX = -1117.5;
float offsetY = -675.0;
float offsetZ = 0.0; // TODO: measure this properly (see calibration note below)
float declination = 2.63;

// Gyro zero-rate bias, computed at startup while the board is held still
float gyroBiasX = 0;
float gyroBiasY = 0;

float pitch = 0;
float roll = 0;
float alpha = 0.92; // lowered from 0.96 so the filter recovers faster from any transient error

unsigned long lastTime = 0;

// Keeps an angle within [-180, 180] so drift/transients can't accumulate
// into physically meaningless values like -524 degrees.
float wrapAngle(float angle) {
  while (angle > 180.0) angle -= 360.0;
  while (angle < -180.0) angle += 360.0;
  return angle;
}

void setupWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT... ");
    String clientId = "ESP32S3_STINGRAY_";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("MQTT Connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }

  // The loop above can block for many seconds (or longer). Reset lastTime so
  // the next dt calculation doesn't see the stall as elapsed rotation time.
  lastTime = millis();
}

// Reads raw accel+gyro from the MPU6050. Returns true only if a full 14-byte
// frame was received; on failure the out-params are left untouched.
bool readMPU6050(int16_t &axRaw, int16_t &ayRaw, int16_t &azRaw,
                  int16_t &gxRaw, int16_t &gyRaw, int16_t &gzRaw) {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) {
    return false;
  }

  uint8_t received = Wire.requestFrom(MPU6050_ADDR, 14, true);
  if (received != 14) {
    // Drain whatever partial data is there so it doesn't corrupt the next read
    while (Wire.available()) Wire.read();
    return false;
  }

  axRaw = (Wire.read() << 8) | Wire.read();
  ayRaw = (Wire.read() << 8) | Wire.read();
  azRaw = (Wire.read() << 8) | Wire.read();

  Wire.read(); // temp high byte
  Wire.read(); // temp low byte

  gxRaw = (Wire.read() << 8) | Wire.read();
  gyRaw = (Wire.read() << 8) | Wire.read();
  gzRaw = (Wire.read() << 8) | Wire.read();

  return true;
}

// Averages gyro readings over ~1 second while the board should be stationary.
// Call this once in setup(), after the board has settled on a flat surface.
void calibrateGyro() {
  Serial.println("Calibrating gyro - keep the board still...");

  const int samples = 200;
  double sumX = 0;
  double sumY = 0;
  int validSamples = 0;

  int16_t axRaw, ayRaw, azRaw, gxRaw, gyRaw, gzRaw;

  for (int i = 0; i < samples; i++) {
    if (readMPU6050(axRaw, ayRaw, azRaw, gxRaw, gyRaw, gzRaw)) {
      sumX += gxRaw / 131.0;
      sumY += gyRaw / 131.0;
      validSamples++;
    }
    delay(5);
  }

  if (validSamples > 0) {
    gyroBiasX = sumX / validSamples;
    gyroBiasY = sumY / validSamples;
  }

  Serial.print("Gyro bias X: ");
  Serial.print(gyroBiasX);
  Serial.print("  Gyro bias Y: ");
  Serial.println(gyroBiasY);
}

void setup() {
  Serial.begin(115200);
  delay(3000);

  randomSeed(analogRead(0)); // seed so MQTT client IDs don't repeat every boot

  Wire.begin(SDA_PIN, SCL_PIN);

  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission();

  if (!qmc.begin(0x2C, &Wire)) {
    Serial.println("QMC5883P not found");
    while (1);
  }

  qmc.setMode(QMC5883P_MODE_NORMAL);
  qmc.setODR(QMC5883P_ODR_50HZ);
  qmc.setOSR(QMC5883P_OSR_8);
  qmc.setRange(QMC5883P_RANGE_2G);

  calibrateGyro();

  setupWiFi();

  client.setServer(mqtt_server, mqtt_port);

  lastTime = millis();

  Serial.println("Phase 5 - Step 5.3 Sensor Data Publish Started");
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }

  client.loop();

  unsigned long currentTime = millis();
  float dt = (currentTime - lastTime) / 1000.0;
  lastTime = currentTime;

  // Guard against a stale/huge dt (e.g. after an MQTT reconnect stall) being
  // integrated as real rotation.
  if (dt > 0.2 || dt <= 0) {
    dt = 0.02;
  }

  int16_t axRaw, ayRaw, azRaw, gxRaw, gyRaw, gzRaw;

  if (!readMPU6050(axRaw, ayRaw, azRaw, gxRaw, gyRaw, gzRaw)) {
    Serial.println("MPU6050 read failed, skipping this cycle");
    delay(60);
    return;
  }

  float ax = axRaw / 16384.0;
  float ay = ayRaw / 16384.0;
  float az = azRaw / 16384.0;

  float gx = (gxRaw / 131.0) - gyroBiasX;
  float gy = (gyRaw / 131.0) - gyroBiasY;

  float accelPitch = atan2(ax, sqrt((ay * ay) + (az * az))) * 180.0 / PI;
  float accelRoll = atan2(ay, az) * 180.0 / PI;

  pitch = alpha * (pitch + gy * dt) + (1 - alpha) * accelPitch;
  roll = alpha * (roll + gx * dt) + (1 - alpha) * accelRoll;

  // Bound pitch/roll back into a physically meaningful range every cycle
  pitch = wrapAngle(pitch);
  roll = wrapAngle(roll);

  int16_t mx = 0;
  int16_t my = 0;
  int16_t mz = 0;

  qmc.getRawMagnetic(&mx, &my, &mz);

  float x = mx - offsetX;
  float y = my - offsetY;
  float z = mz - offsetZ;

  // Tilt-compensated yaw: rotate the horizontal-plane mag vector using the
  // current pitch/roll so heading is correct even when the board isn't level.
  float pitchRad = pitch * PI / 180.0;
  float rollRad = roll * PI / 180.0;

  float Xh = x * cos(rollRad) + z * sin(rollRad);
  float Yh = x * sin(pitchRad) * sin(rollRad) + y * cos(pitchRad)
             - z * sin(pitchRad) * cos(rollRad);

  float yaw = atan2(Yh, Xh) * 180.0 / PI;

  if (yaw < 0) {
    yaw += 360.0;
  }

  yaw += declination;

  if (yaw >= 360.0) {
    yaw -= 360.0;
  }

  // Fixed-size buffer instead of chained String concatenation to avoid heap
  // fragmentation over long-running sessions.
  char payload[220];
  snprintf(payload, sizeof(payload),
    "{\"pitch\":%.2f,\"roll\":%.2f,\"yaw\":%.2f,"
    "\"ax\":%d,\"ay\":%d,\"az\":%d,"
    "\"gx\":%d,\"gy\":%d,\"gz\":%d,"
    "\"mx\":%d,\"my\":%d,\"mz\":%d}",
    pitch, roll, yaw,
    axRaw, ayRaw, azRaw,
    gxRaw, gyRaw, gzRaw,
    mx, my, mz);

  Serial.println(payload);
  client.publish(mqtt_topic, payload);

  delay(60);
}
