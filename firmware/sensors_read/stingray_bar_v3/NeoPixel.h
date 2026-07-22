#ifndef NEOPIXEL_DEVICE_H
#define NEOPIXEL_DEVICE_H

#include <Adafruit_NeoPixel.h>
#include "config.h"

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

void setupNeoPixel() {
  strip.begin();
  strip.setBrightness(40); // keep modest if powered from ESP32 5V
  strip.show();            // all off
}

// Map vibration PWM (0..MAX_VIB) -> number of LEDs (0..30), ceiling division
inline int ledsFromPWM(int pwm) {
  if (pwm <= 0) return 0;
  int count = (pwm * 30 + (MAX_VIB - 1)) / MAX_VIB; // ceil(pwm/MAX_VIB*30)
  return constrain(count, 0, 30);
}

void showAllGreenOneShot(uint16_t ms) {
  for (int i = 0; i < LED_COUNT; ++i) strip.setPixelColor(i, strip.Color(0, 255, 0));
  strip.show();
  delay(ms);
  strip.clear();
  strip.show();
}

// Draw red bars for pitch mode (vibration motor A and B sides). Called every HW loop.
void drawPitchLEDs(int vibA, int vibB) {
  strip.clear();

  // Side A -> LEDs 1..30 (index 0..29), filling from LED 30 backward to 1
  int aCount = ledsFromPWM(vibA);
  if (aCount > 0) {
    int start = 29;                 // LED 30 index
    int end   = 29 - (aCount - 1);  // go backward
    for (int i = start; i >= end; --i) {
      strip.setPixelColor(i, strip.Color(255, 0, 0)); // RED
    }
  }

  // Side B -> LEDs 31..60 (index 30..59), filling from LED 31 forward to 60
  int bCount = ledsFromPWM(vibB);
  if (bCount > 0) {
    int start = 30;                 // LED 31 index
    int end   = 30 + (bCount - 1);  // go forward
    for (int i = start; i <= end; ++i) {
      strip.setPixelColor(i, strip.Color(255, 0, 0)); // RED
    }
  }

  strip.show();
}

// Draw blue for roll-override mode (all 60 LEDs)
void drawRollLEDsBlue() {
  for (int i = 0; i < LED_COUNT; ++i) strip.setPixelColor(i, strip.Color(0, 0, 255));
  strip.show();
}

inline void clearLEDs() {
  strip.clear();
  strip.show();
}

#endif