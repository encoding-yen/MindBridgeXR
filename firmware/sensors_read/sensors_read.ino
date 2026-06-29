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

float offsetX = -1117.5;
float offsetY = -675.0;
float declination = 2.63;

float pitch = 0;
float roll = 0;
float alpha = 0.96;

unsigned long lastTime = 0;

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
}

void setup() {
  Serial.begin(115200);
  delay(3000);

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

  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);

  Wire.requestFrom(MPU6050_ADDR, 14, true);

  int16_t axRaw = (Wire.read() << 8) | Wire.read();
  int16_t ayRaw = (Wire.read() << 8) | Wire.read();
  int16_t azRaw = (Wire.read() << 8) | Wire.read();

  Wire.read();
  Wire.read();

  int16_t gxRaw = (Wire.read() << 8) | Wire.read();
  int16_t gyRaw = (Wire.read() << 8) | Wire.read();
  int16_t gzRaw = (Wire.read() << 8) | Wire.read();

  float ax = axRaw / 16384.0;
  float ay = ayRaw / 16384.0;
  float az = azRaw / 16384.0;

  float gx = gxRaw / 131.0;
  float gy = gyRaw / 131.0;

  float accelPitch = atan2(ax, sqrt((ay * ay) + (az * az))) * 180.0 / PI;
  float accelRoll = atan2(ay, az) * 180.0 / PI;

  pitch = alpha * (pitch + gy * dt) + (1 - alpha) * accelPitch;
  roll = alpha * (roll + gx * dt) + (1 - alpha) * accelRoll;

  int16_t mx = 0;
  int16_t my = 0;
  int16_t mz = 0;

  qmc.getRawMagnetic(&mx, &my, &mz);

  float x = mx - offsetX;
  float y = my - offsetY;

  float yaw = atan2(y, x) * 180.0 / PI;

  if (yaw < 0) {
    yaw += 360.0;
  }

  yaw += declination;

  if (yaw >= 360.0) {
    yaw -= 360.0;
  }

  String payload = "{";
  payload += "\"pitch\":" + String(pitch, 2) + ",";
  payload += "\"roll\":" + String(roll, 2) + ",";
  payload += "\"yaw\":" + String(yaw, 2) + ",";
  payload += "\"ax\":" + String(axRaw) + ",";
  payload += "\"ay\":" + String(ayRaw) + ",";
  payload += "\"az\":" + String(azRaw) + ",";
  payload += "\"gx\":" + String(gxRaw) + ",";
  payload += "\"gy\":" + String(gyRaw) + ",";
  payload += "\"gz\":" + String(gzRaw) + ",";
  payload += "\"mx\":" + String(mx) + ",";
  payload += "\"my\":" + String(my) + ",";
  payload += "\"mz\":" + String(mz);
  payload += "}";

  Serial.println(payload);
  client.publish(mqtt_topic, payload.c_str());

  delay(60);
}