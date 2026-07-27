#include <Wire.h>
#include "config.h"
#include "ICM20948.h"
#include "TOF.h"
#include "L298N.h"
#include "NeoPixel.h"
#include "ESPNOW.h"
#include "MQTT.h"

QueueHandle_t gQueue;

TaskHandle_t taskHWHandle;
TaskHandle_t taskNetHandle;

void taskHW(void*);
void taskNet(void*);

void enqueueSample(const PoseSample &s) {
  if (xQueueSendToBack(gQueue, &s, 0) != pdTRUE) {
    PoseSample dump;
    xQueueReceive(gQueue, &dump, 0);
    xQueueSendToBack(gQueue, &s, 0);
  }
}

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
  if (!setupTOF()) {
    Serial.println("[HW] VL53L0X init failed. Check wiring/power.");
    while (true) delay(1000);
  }

  Serial.println("[HW] Calibrating gyro - keep device still...");
  calibrateGyroICM();

  showAllGreenOneShot(1000);
  setupL298N();

  if (!setupEspNowReceiver()) {
    Serial.println("[ESPNOW] Init failed, halting.");
    while (true) delay(1000);
  }

  gQueue = xQueueCreate(SAMPLE_QUEUE_LEN, sizeof(PoseSample));
  if (!gQueue) {
    Serial.println("[SYS] Queue allocation failed, halting.");
    while (true) delay(1000);
  }

  BaseType_t ok1 = xTaskCreatePinnedToCore(taskHW,  "HW",  4096, nullptr, 2, &taskHWHandle,  0);
  BaseType_t ok2 = xTaskCreatePinnedToCore(taskNet, "NET", 6144, nullptr, 2, &taskNetHandle, 1);
  if (ok1 != pdPASS || ok2 != pdPASS) {
    Serial.println("[SYS] Task creation failed, halting.");
    while (true) delay(1000);
  }
}

void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}

// ================== Core 0: Hardware (this grip's own sensors) ==================
void taskHW(void*) {
  Serial.println("[HW] Task started (Core 0).");

  uint32_t lastCtrl = millis();
  uint32_t lastOrientation = millis();

  for (;;) {
    uint32_t nowOrientation = millis();
    float dt = (nowOrientation - lastOrientation) / 1000.0;
    lastOrientation = nowOrientation;
    if (dt > 0.2 || dt <= 0) dt = 0.002;

    updateOrientation(dt);
    vTaskDelay(pdMS_TO_TICKS(2));

    uint32_t now = millis();
    if ((int32_t)(now - lastCtrl) >= (int32_t)HW_PERIOD_MS) {
      lastCtrl += HW_PERIOD_MS;

      float pitch = getPitch();
      float roll  = getRoll();
      float yaw   = getYaw();

      autoZeroCheck(getGyroX(), getGyroY(), getGyroZ(), getAccelMagnitude(), pitch, roll);
      float altitude = readHeightMM(pitch, roll);
      bool altitudeValid = !isnan(altitude);

      bool flipped = (pitch > 90.0f || pitch < -90.0f);
      if (pitch > 90.0f) pitch -= 180.0f;
      else if (pitch < -90.0f) pitch += 180.0f;

      int vibA = 0, vibB = 0;
      bool rollOverride = false;

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
      } else {
        vibrationPWM(VIB_A_PIN, vibA);
        vibrationPWM(VIB_B_PIN, vibB);
      }

      if (vibA == 0 && vibB == 0) {
        clearLEDs();
      } else if (rollOverride) {
        drawRollLEDsBlue();
      } else {
        drawPitchLEDs(vibA, vibB);
      }

      char line[220];
      snprintf(line, sizeof(line),
               "[HW] Pitch: %.1f  Roll: %.1f  Yaw: %.1f  Alt: %s  VIB_A: %d  VIB_B: %d",
               pitch, roll, yaw,
               altitudeValid ? String(altitude, 1).c_str() : "N/A",
               vibA, vibB);
      Serial.println(line);

      PoseSample s{
        pitch, roll, yaw,
        getAccelX(), getAccelY(), getAccelZ(),
        getGyroX(), getGyroY(), getGyroZ(),
        getMagX(), getMagY(), getMagZ(),
        altitudeValid ? altitude : 0
      };
      enqueueSample(s);
    }
  }
}

// ================== Core 1: Networking (WiFi/MQTT + merge with secondary) ==================
void taskNet(void*) {
  Serial.println("[NET] Task started (Core 1).");
  setupWiFi();
  setupMQTT();

  for (;;) {
    mqttEnsureConnected();
    mqttLoop();

    if (uxQueueMessagesWaiting(gQueue) == 0) {
      vTaskDelay(pdMS_TO_TICKS(10));
      continue;
    }

    PoseSample s;
    if (xQueueReceive(gQueue, &s, 0) == pdTRUE) {
      bool secOnline = isSecondaryConnected();
      publishMergedSample(s, secondarySample, secOnline);
    }
  }
}
