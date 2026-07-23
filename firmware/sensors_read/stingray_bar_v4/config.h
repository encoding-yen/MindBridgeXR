#ifndef CONFIG_H
#define CONFIG_H

// ================== I2C (ICM-20948) ==================
#define SDA_PIN 21
#define SCL_PIN 22

// Complementary filter blend factor for pitch/roll
const float FILTER_ALPHA = 0.92;

// Magnetometer hard-iron offsets (X/Y/Z) for the ICM-20948's built-in
// AK09916. Re-run calibration if you move to a new location or change
// nearby ferrous/magnetic components. TODO: calibrate these for real --
// currently carried over placeholders, not yet measured for this board.
const float MAG_OFFSET_X = 0.0;
const float MAG_OFFSET_Y = 0.0;
const float MAG_OFFSET_Z = 0.0;
const float MAG_DECLINATION = 2.63;

// ================== L298N vibration motor driver ==================
// Two vibration motors, one per side of the bar (for directional haptics)
#define VIB_A_PIN 25   // was IN1
#define VIB_B_PIN 27   // was IN3

// ================== NeoPixel strip ==================
#define LED_PIN   23          // free GPIO on ESP32
#define LED_COUNT 60

// ================== Control constants ==================
// TODO: add end value for pitch where at that value all LEDs are on
// TODO: make blue override red only after a certain value (look at Ghaith's code)
const float P_DEADZONE  = 3.0;   // pitch threshold
const float R_DEADZONE  = 9;     // roll threshold
const float MAX_ANGLE   = 10.0;  // degrees; beyond this, vibration intensity caps
const int   MAX_VIB     = 200;   // 0..255 cap (was MAX_SPEED)
const int   MIN_VIB     = 30;    // starting vibration intensity (was MIN_SPEED)

// HW loop period for control/POST enqueue
static const uint32_t HW_PERIOD_MS = 250;

// ================== Wi-Fi / MQTT ==================
static const char* WIFI_SSID     = "QSTP VC";
static const char* WIFI_PASSWORD = "qstp1234";
// Matches the topic the Python backend's MQTT listener subscribes to
// (backend/app/mqtt/mqtt_client.py) -- do not change without updating that too.
static const char* MQTT_BROKER = "broker.hivemq.com";
static const int   MQTT_PORT   = 1883;
static const char* MQTT_TOPIC  = "stingray/imu/data";

// ================== HW -> NET queue ==================
// Field set matches backend/app/models/imu_reading.py exactly (pitch through
// mz), plus "altitude" which the backend currently ignores/doesn't store --
// see MQTT.h for details on why that's safe to send anyway.
struct PoseSample {
  float pitch, roll, yaw;
  float ax, ay, az;
  float gx, gy, gz;
  float mx, my, mz;
  float altitude; // mm, tilt-compensated + zeroed ToF reading
};
#define SAMPLE_QUEUE_LEN 30

// ================== ToF auto-zero (no physical button) ==================
// Thresholds used to detect "the bar is at rest" so the ToF baseline can
// be (re)zeroed automatically -- see TOF.h
const float REST_GYRO_THRESHOLD_DPS = 2.0;   // deg/sec
const float REST_ACCEL_THRESHOLD_G  = 0.05;  // deviation from 1g
const unsigned long REST_HOLD_MS    = 500;   // must be still this long before (re)zeroing

#endif