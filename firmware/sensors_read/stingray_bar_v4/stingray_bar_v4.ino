#include <Wire.h>
#include "config.h"
#include "ICM20948.h"
#include "TOF.h"
#include "L298N.h"
#include "NeoPixel.h"
#include "MQTT.h"

QueueHandle_t gQueue;

// Init flags
volatile bool gHwReady  = false;
volatile bool gNetReady = false;

TaskHandle_t taskHWHandle;
TaskHandle_t taskNetHandle;

void taskHW(void*);   // Core 0: Hardware
void taskNet(void*);  // Core 1: WiFi + HTTP POST

// Pushes a sample to the queue, dropping the oldest one if it's full.
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
  Serial.println("[HW] Calibration done.");

  // One-time green flash after calibration
  showAllGreenOneShot(1000);

  setupL298N();

  gQueue = xQueueCreate(SAMPLE_QUEUE_LEN, sizeof(PoseSample));
  if (!gQueue) {
    Serial.println("[SYS] Queue allocation failed, halting.");
    while (true) delay(1000);
  }

  // Create tasks (Core 0 = HW, Core 1 = NET)
  BaseType_t ok1 = xTaskCreatePinnedToCore(taskHW,  "HW",  4096, nullptr, 2, &taskHWHandle,  0);
  BaseType_t ok2 = xTaskCreatePinnedToCore(taskNet, "NET", 6144, nullptr, 2, &taskNetHandle, 1);
  if (ok1 != pdPASS || ok2 != pdPASS) {
    Serial.println("[SYS] Task creation failed, halting.");
    while (true) delay(1000);
  }
}

void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000)); // unused; work runs in tasks
}

// ================== Core 0: Hardware ==================
void taskHW(void*) {
  Serial.println("[HW] Task started (Core 0).");
  gHwReady = true;

  uint32_t lastCtrl = millis();
  uint32_t lastOrientation = millis();

  for (;;) {
    // High-rate sensor fusion -- dt is the real elapsed time since last update
    uint32_t nowOrientation = millis();
    float dt = (nowOrientation - lastOrientation) / 1000.0;
    lastOrientation = nowOrientation;
    if (dt > 0.2 || dt <= 0) dt = 0.002; // guard against stale/huge dt

    updateOrientation(dt);
    vTaskDelay(pdMS_TO_TICKS(2));

    // 250 ms control & queue
    uint32_t now = millis();
    if ((int32_t)(now - lastCtrl) >= (int32_t)HW_PERIOD_MS) {
      lastCtrl += HW_PERIOD_MS;

      // Read angles (deg)
      float pitch = getPitch();
      float roll  = getRoll();
      float yaw   = getYaw();

      // Auto-zero the ToF baseline whenever the bar has been still for a
      // moment -- no physical button, just detects rest via the IMU.
      autoZeroCheck(getGyroX(), getGyroY(), getGyroZ(), getAccelMagnitude(), pitch, roll);
      float altitude = readHeightMM(pitch, roll); // mm, tilt-compensated + zeroed
      bool altitudeValid = !isnan(altitude);

      // Check if we're in the flipped orientation (around 180deg)
      bool flipped = (pitch > 90.0f || pitch < -90.0f);

      // Map pitch to -90..90 range for consistent control logic
      if (pitch > 90.0f) { pitch = pitch - 180.0f; }
      else if (pitch < -90.0f) { pitch = pitch + 180.0f; }

      int vibA = 0, vibB = 0;
      bool rollOverride = false;

      // ---- Combined logic with roll override ----
      // if (fabs(roll) > R_DEADZONE) {
      //   // ROLL MODE: both vibration motors ON with same intensity (from roll magnitude)
      //   float norm = (fabs(roll) - R_DEADZONE) / (MAX_ANGLE - R_DEADZONE);
      //   norm = constrain(norm, 0.0f, 1.0f);
      //   int vib = MIN_VIB + (int)(norm * (MAX_VIB - MIN_VIB));
      //   vibA = vib;
      //   vibB = vib;
      //   rollOverride = true;
      // } else {
        // PITCH MODE: one vibration motor ON depending on pitch sign
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
      // }

      // Flip outputs if in the flipped orientation
      if (flipped) {
        int temp = vibA;
        vibA = vibB;
        vibB = temp;
      }

      // Apply vibration intensity, or OFF in deadzone
      if (vibA == 0 && vibB == 0) {
        vibrationOff();
      } else {
        vibrationPWM(VIB_A_PIN, vibA);
        vibrationPWM(VIB_B_PIN, vibB);
      }

      // ---- LED update (every HW loop) ----
      if (vibA == 0 && vibB == 0) {
        clearLEDs();
      } else if (rollOverride) {
        drawRollLEDsBlue(); // all blue when roll dominates
      } else {
        drawPitchLEDs(vibA, vibB); // red sections for pitch
      }

      // Print HW status
      char line[260];
      snprintf(line, sizeof(line),
               "[HW] Pitch: %.1f  Roll: %.1f  Yaw: %.1f  Alt: %s  VIB_A: %d  VIB_B: %d  Mode:%s",
               pitch, roll, yaw,
               altitudeValid ? String(altitude, 1).c_str() : "N/A",
               vibA, vibB, rollOverride ? "ROLL" : "PITCH");
      Serial.println(line);

      // Enqueue a full sample for networking -- field set matches what the
      // backend's MQTT listener expects (pitch..mz), plus altitude tacked on.
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

// ================== Core 1: Networking ==================
void taskNet(void*) {
  Serial.println("[NET] Task started (Core 1).");
  setupWiFi();
  setupMQTT();
  gNetReady = true;

  for (;;) {
    mqttEnsureConnected(); // blocks internally until connected, with retry/backoff
    mqttLoop();            // keeps the MQTT client's internal state serviced

    if (uxQueueMessagesWaiting(gQueue) == 0) {
      vTaskDelay(pdMS_TO_TICKS(10));
      continue;
    }

    PoseSample s;
    if (xQueueReceive(gQueue, &s, 0) == pdTRUE) {
      publishPoseSample(s);
    }
  }
}
