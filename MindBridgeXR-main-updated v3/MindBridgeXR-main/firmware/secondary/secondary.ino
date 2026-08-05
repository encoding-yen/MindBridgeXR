#include <Wire.h>
#include "config.h"
#include "ICM20948.h"
#include "TOF.h"
#include "L298N.h"
#include "NeoPixel.h"
#include "ESPNOW.h"

bool tofAvailable = false;

void setup() {
  Serial.begin(115200);
  delay(200);

  setupNeoPixel();

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000);

  Serial.println("[HW] Initializing ICM-20948...");
  if (!setupICM20948()) {
    Serial.println("[HW] ICM-20948 init failed. Check wiring/power.");
    while (true) delay(1000);
  }

  Serial.println("[HW] Initializing VL53L0X...");
  tofAvailable = setupTOF();
  if (!tofAvailable) {
    Serial.println("[HW] WARNING: VL53L0X not found. Continuing without altitude -- "
                    "tilt/vibration/LEDs will still work normally.");
  }

  Serial.println("[HW] Calibrating gyro - keep device still...");
  calibrateGyroICM();

  showAllGreenOneShot(1000);
  setupL298N();

  if (!setupEspNowSender()) {
    Serial.println("[ESPNOW] Init failed, halting.");
    while (true) delay(1000);
  }

  Serial.println("[HW] Secondary grip ready.");
}

void loop() {
  static uint32_t lastCtrl = millis();
  static uint32_t lastOrientation = millis();
  static uint32_t lastSend = millis();

  uint32_t nowOrientation = millis();
  float dt = (nowOrientation - lastOrientation) / 1000.0;
  lastOrientation = nowOrientation;
  if (dt > 0.2 || dt <= 0) dt = 0.002;

  updateOrientation(dt);
  delay(2);

  uint32_t now = millis();
  if ((int32_t)(now - lastCtrl) < (int32_t)HW_PERIOD_MS) {
    return;
  }
  lastCtrl += HW_PERIOD_MS;

  float pitch = getPitch();
  float roll  = getRoll();
  float yaw   = getYaw();

  float altitude = 0;
  bool altitudeValid = false;
  if (tofAvailable) {
    autoZeroCheck(getGyroX(), getGyroY(), getGyroZ(), getAccelMagnitude(), pitch, roll);
    altitude = readHeightMM(pitch, roll);
    altitudeValid = !isnan(altitude);
  }

  bool flipped = (pitch > 90.0f || pitch < -90.0f);
  if (pitch > 90.0f) pitch -= 180.0f;
  else if (pitch < -90.0f) pitch += 180.0f;

  int vibA = 0, vibB = 0;

  if (pitch > P_DEADZONE) {
    float norm = (pitch - P_DEADZONE) / (MAX_ANGLE - P_DEADZONE);
    norm = constrain(norm, 0.0f, 1.0f);
    vibA = MIN_VIB + (int)(norm * (MAX_VIB - MIN_VIB));
    vibB = 0;
  } else if (pitch < -P_DEADZONE) {
    float norm = ((-pitch) - P_DEADZONE) / (MAX_ANGLE - P_DEADZONE);
    norm = constrain(norm, 0.0f, 1.0f);
    vibB = MIN_VIB + (int)(norm * (MAX_VIB - MIN_VIB));
    vibA = 0;
  } else {
    vibA = 0;
    vibB = 0;
  }

  if (flipped) {
    int temp = vibA;
    vibA = vibB;
    vibB = temp;
  }

  if (vibA == 0 && vibB == 0) {
    vibrationOff();
    clearLEDs();
  } else {
    vibrationPWM(VIB_A_PIN, vibA);
    vibrationPWM(VIB_B_PIN, vibB);
    drawPitchLEDs(vibA, vibB);
  }

  char line[220];
  snprintf(line, sizeof(line),
           "[HW] Pitch: %.1f  Roll: %.1f  Yaw: %.1f  Alt: %s  VIB_A: %d  VIB_B: %d",
           pitch, roll, yaw,
           altitudeValid ? String(altitude, 1).c_str() : "N/A",
           vibA, vibB);
  Serial.println(line);

  // Broadcast this grip's reading to the primary at a slower, fixed rate --
  // doesn't need to match the local control loop rate.
  if ((int32_t)(now - lastSend) >= (int32_t)ESPNOW_SEND_PERIOD_MS) {
    lastSend = now;
    PoseSample s{
      pitch, roll, yaw,
      getAccelX(), getAccelY(), getAccelZ(),
      getGyroX(), getGyroY(), getGyroZ(),
      getMagX(), getMagY(), getMagZ(),
      altitudeValid ? altitude : 0
    };
    sendSampleToPrimary(s);
  }
}
