#ifndef ICM20948_H
#define ICM20948_H

#include <Wire.h>
#include <math.h>
#include <Adafruit_ICM20X.h>
#include <Adafruit_ICM20948.h>
#include <Adafruit_Sensor.h>
#include "config.h"

Adafruit_ICM20948 icm;

float gyroBiasX = 0;
float gyroBiasY = 0;

float pitch = 0;
float roll = 0;
float yaw = 0;

// Latest raw readings, kept around so other modules (like the ToF at-rest
// detector) can check them without re-reading the sensor.
float lastAccelX = 0, lastAccelY = 0, lastAccelZ = 0; // g
float lastGyroX = 0, lastGyroY = 0, lastGyroZ = 0;    // deg/s

// Keeps an angle within [-180, 180] so drift/transients can't accumulate
// into physically meaningless values like -524 degrees.
float wrapAngle(float angle) {
  while (angle > 180.0) angle -= 360.0;
  while (angle < -180.0) angle += 360.0;
  return angle;
}

bool setupICM20948() {
  if (!icm.begin_I2C()) {
    return false;
  }

  icm.setAccelRange(ICM20948_ACCEL_RANGE_4_G);
  icm.setGyroRange(ICM20948_GYRO_RANGE_500_DPS);

  return true;
}

// Reads one frame of accel/gyro/mag. Returns true if the read succeeded.
// Outputs: accel in g, gyro in deg/s, mag in uT.
bool readICM20948(float &ax, float &ay, float &az,
                   float &gx, float &gy, float &gz,
                   float &mx, float &my, float &mz) {
  sensors_event_t accelEvent, gyroEvent, tempEvent, magEvent;
  if (!icm.getEvent(&accelEvent, &gyroEvent, &tempEvent, &magEvent)) {
    return false;
  }

  // Library gives accel in m/s^2 -- convert to g to match the rest of the math
  ax = accelEvent.acceleration.x / 9.80665;
  ay = accelEvent.acceleration.y / 9.80665;
  az = accelEvent.acceleration.z / 9.80665;

  // Library gives gyro in rad/s -- convert to deg/s
  gx = gyroEvent.gyro.x * 180.0 / PI;
  gy = gyroEvent.gyro.y * 180.0 / PI;
  gz = gyroEvent.gyro.z * 180.0 / PI;

  mx = magEvent.magnetic.x;
  my = magEvent.magnetic.y;
  mz = magEvent.magnetic.z;

  return true;
}

// Averages gyro readings over ~1 second while the board should be stationary.
// Call this once in setup(), after the board has settled on a flat surface.
void calibrateGyroICM() {
  Serial.println("Calibrating gyro - keep the board still...");

  const int samples = 200;
  double sumX = 0;
  double sumY = 0;
  int validSamples = 0;

  float ax, ay, az, gx, gy, gz, mx, my, mz;

  for (int i = 0; i < samples; i++) {
    if (readICM20948(ax, ay, az, gx, gy, gz, mx, my, mz)) {
      sumX += gx;
      sumY += gy;
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

// Updates the global pitch/roll/yaw estimate from one cycle of sensor data.
// Call once per loop with the actual dt (seconds since last call).
void updateOrientation(float dt) {
  float ax, ay, az, gx, gy, gz, mx, my, mz;

  if (!readICM20948(ax, ay, az, gx, gy, gz, mx, my, mz)) {
    return; // keep last known values on a bad read
  }

  lastAccelX = ax; lastAccelY = ay; lastAccelZ = az;
  lastGyroX = gx - gyroBiasX; lastGyroY = gy - gyroBiasY; lastGyroZ = gz;

  float accelPitch = atan2(ax, sqrt((ay * ay) + (az * az))) * 180.0 / PI;
  float accelRoll = atan2(ay, az) * 180.0 / PI;

  pitch = FILTER_ALPHA * (pitch + lastGyroY * dt) + (1 - FILTER_ALPHA) * accelPitch;
  roll = FILTER_ALPHA * (roll + lastGyroX * dt) + (1 - FILTER_ALPHA) * accelRoll;

  pitch = wrapAngle(pitch);
  roll = wrapAngle(roll);

  // Tilt-compensated yaw from the built-in magnetometer
  float x = mx - MAG_OFFSET_X;
  float y = my - MAG_OFFSET_Y;
  float z = mz - MAG_OFFSET_Z;

  float pitchRad = pitch * PI / 180.0;
  float rollRad = roll * PI / 180.0;

  float Xh = x * cos(rollRad) + z * sin(rollRad);
  float Yh = x * sin(pitchRad) * sin(rollRad) + y * cos(pitchRad)
             - z * sin(pitchRad) * cos(rollRad);

  float computedYaw = atan2(Yh, Xh) * 180.0 / PI;
  if (computedYaw < 0) computedYaw += 360.0;
  computedYaw += MAG_DECLINATION;
  if (computedYaw >= 360.0) computedYaw -= 360.0;

  yaw = computedYaw;
}

inline float getPitch() { return pitch; }
inline float getRoll()  { return roll; }
inline float getYaw()   { return yaw; }

// Magnitude of the current accel vector in g -- ~1.0 when stationary
// (gravity only), used by the ToF module's at-rest detector.
inline float getAccelMagnitude() {
  return sqrt(lastAccelX * lastAccelX + lastAccelY * lastAccelY + lastAccelZ * lastAccelZ);
}

inline float getGyroX() { return lastGyroX; }
inline float getGyroY() { return lastGyroY; }
inline float getGyroZ() { return lastGyroZ; }

#endif