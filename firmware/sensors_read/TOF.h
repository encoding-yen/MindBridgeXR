#ifndef TOF_H
#define TOF_H

#include <Wire.h>
#include <Adafruit_VL53L0X.h>
#include <math.h>

Adafruit_VL53L0X tof;

// Set once during setup: the raw slant-distance reading when the bar is
// resting at your chosen zero point (e.g. on the floor, or on a rack).
// trueHeight() subtracts this so "0" means "at the reference position."
float tofZeroOffsetMM = 0;

bool setupTOF() {
  if (!tof.begin()) {
    return false;
  }
  return true;
}

// Raw slant-distance reading in mm along the sensor's beam axis.
// Returns -1 if the reading is invalid (out of range / no target found).
float readTOFRaw() {
  VL53L0X_RangingMeasurementData_t measure;
  tof.rangingTest(&measure, false);

  if (measure.RangeStatus == 4) {
    // 4 = "out of range" per the VL53L0X status codes
    return -1;
  }
  return measure.RangeMilliMeter;
}

// Converts a raw slant-distance reading into true vertical height, using the
// bar's current pitch/roll (in degrees) from the ICM-20948 to correct for the
// sensor not pointing straight down. Only valid while the beam still lands
// on the floor -- see the note on field-of-view limits before trusting this
// at large tilt angles.
float tiltCompensatedHeight(float rawMM, float pitchDeg, float rollDeg) {
  // Combine pitch/roll into a single tilt-from-vertical angle.
  float pitchRad = pitchDeg * PI / 180.0;
  float rollRad  = rollDeg  * PI / 180.0;
  float tiltRad = acos(cos(pitchRad) * cos(rollRad));

  return rawMM * cos(tiltRad);
}

// Call once with the bar at your reference position (e.g. resting on the
// floor) to zero out the height measurement from that point.
void calibrateTOFZero(float pitchDeg, float rollDeg) {
  float raw = readTOFRaw();
  if (raw > 0) {
    tofZeroOffsetMM = tiltCompensatedHeight(raw, pitchDeg, rollDeg);
  }
}

// ---------- Auto-zero (no physical button required) ----------
// Gyms/athletes won't manually recalibrate before each use, so instead of a
// button, we detect when the bar is sitting still (racked or on the floor)
// and treat that as "zero" automatically. Re-running this continuously also
// means it self-corrects for drift and works on whatever surface/floor the
// device happens to be used on that day.
static unsigned long restStartTime = 0;

bool isAtRest(float gyroX, float gyroY, float gyroZ, float accelMagnitudeG) {
  return (fabs(gyroX) < REST_GYRO_THRESHOLD_DPS &&
          fabs(gyroY) < REST_GYRO_THRESHOLD_DPS &&
          fabs(gyroZ) < REST_GYRO_THRESHOLD_DPS &&
          fabs(accelMagnitudeG - 1.0) < REST_ACCEL_THRESHOLD_G);
}

// Call every loop. Locks in a new zero once the bar has been still for
// REST_HOLD_MS. No-op while the bar is moving.
void autoZeroCheck(float gyroX, float gyroY, float gyroZ, float accelMagnitudeG,
                    float pitchDeg, float rollDeg) {
  if (isAtRest(gyroX, gyroY, gyroZ, accelMagnitudeG)) {
    if (restStartTime == 0) {
      restStartTime = millis();
    } else if (millis() - restStartTime >= REST_HOLD_MS) {
      calibrateTOFZero(pitchDeg, rollDeg);
    }
  } else {
    restStartTime = 0;
  }
}

// Full pipeline: raw reading -> tilt-compensated -> zeroed against the
// reference position. Returns NAN if the current reading is invalid.
float readHeightMM(float pitchDeg, float rollDeg) {
  float raw = readTOFRaw();
  if (raw < 0) {
    return NAN;
  }
  return tiltCompensatedHeight(raw, pitchDeg, rollDeg) - tofZeroOffsetMM;
}

#endif
