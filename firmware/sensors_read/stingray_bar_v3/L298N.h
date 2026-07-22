#ifndef L298N_H
#define L298N_H

#include "config.h"

void setupL298N() {
  pinMode(VIB_A_PIN, OUTPUT);
  pinMode(VIB_B_PIN, OUTPUT);
  analogWrite(VIB_A_PIN, 0);
  analogWrite(VIB_B_PIN, 0);
}

inline void vibrationPWM(int pin, int pwm) {
  pwm = constrain(pwm, 0, 255);
  analogWrite(pin, pwm);
}

inline void vibrationOff() {
  analogWrite(VIB_A_PIN, 0);
  analogWrite(VIB_B_PIN, 0);
}

#endif