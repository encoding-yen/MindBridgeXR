#ifndef CONFIG_H
#define CONFIG_H

// ================== I2C (ICM-20948 + VL53L0X) ==================
#define SDA_PIN 21
#define SCL_PIN 22

// ================== L298N vibration motor driver ==================
#define VIB_A_PIN 25
#define VIB_B_PIN 27

// ================== NeoPixel strip (this grip's segment only) ==================
#define LED_PIN   23
#define LED_COUNT 30

// ================== Control constants ==================
const float P_DEADZONE  = 3.0;
const float R_DEADZONE  = 9;
const float MAX_ANGLE   = 10.0;
const int   MAX_VIB     = 200;
const int   MIN_VIB     = 30;

static const uint32_t HW_PERIOD_MS = 250;

// ================== Complementary filter / magnetometer ==================
const float FILTER_ALPHA = 0.92;
// TODO: calibrate these for real once the board is in hand
const float MAG_OFFSET_X = 0.0;
const float MAG_OFFSET_Y = 0.0;
const float MAG_OFFSET_Z = 0.0;
const float MAG_DECLINATION = 2.63;

// ================== ToF auto-zero (no physical button) ==================
const float REST_GYRO_THRESHOLD_DPS = 2.0;
const float REST_ACCEL_THRESHOLD_G  = 0.05;
const unsigned long REST_HOLD_MS    = 500;

// ================== Shared sensor sample ==================
// Must match primary/config.h exactly -- this is sent as a raw byte struct
// over ESP-NOW, so field order/types have to line up on both sides.
struct PoseSample {
  float pitch, roll, yaw;
  float ax, ay, az;
  float gx, gy, gz;
  float mx, my, mz;
  float altitude;
};

// How often to broadcast this grip's reading to the primary
const uint32_t ESPNOW_SEND_PERIOD_MS = 100;

#endif
