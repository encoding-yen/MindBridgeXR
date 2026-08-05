#ifndef CONFIG_H
#define CONFIG_H

// ================== I2C (ICM-20948 + VL53L0X) ==================
// ESP32-S3 defaults -- prototype board. If/when this moves to a standard
// ESP32 DEV MODULE for the manufactured product, switch back to 21/22.
#define SDA_PIN 8
#define SCL_PIN 9

// ================== L298N vibration motor driver ==================
#define VIB_A_PIN 25
#define VIB_B_PIN 27

// ================== NeoPixel strip (this grip's segment only) ==================
#define LED_PIN   23
#define LED_COUNT 30   // half of the original 60 -- one segment per grip now

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

// ================== Wi-Fi / MQTT ==================
static const char* WIFI_SSID     = "QSTP VC";
static const char* WIFI_PASSWORD = "qstp1234";
static const char* MQTT_BROKER = "broker.hivemq.com";
static const int   MQTT_PORT   = 1883;
static const char* MQTT_TOPIC  = "stingray/imu/data";

// ================== Shared sensor sample ==================
// One grip's worth of readings. Used both for the primary's own local queue
// AND as the exact struct sent over ESP-NOW from secondary -> primary, so
// the two sides can't drift out of sync on field order/types.
struct PoseSample {
  float pitch, roll, yaw;
  float ax, ay, az;
  float gx, gy, gz;
  float mx, my, mz;
  float altitude; // mm, tilt-compensated + zeroed ToF reading
};
#define SAMPLE_QUEUE_LEN 30

// How old a secondary reading can be before the primary treats it as
// "disconnected" rather than stale data.
const unsigned long SECONDARY_TIMEOUT_MS = 2000;

#endif
