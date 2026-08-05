#ifndef ESPNOW_H
#define ESPNOW_H

#include <esp_now.h>
#include <WiFi.h>
#include "config.h"

PoseSample secondarySample = {0};
volatile unsigned long lastSecondaryRxMs = 0;

// ESP-NOW's receive callback. Signature differs slightly across core
// versions -- this matches recent ESP32 Arduino core (esp_now_recv_info_t*).
// If your installed core is older and this fails to compile, the fix is
// swapping the first parameter to `const uint8_t *mac`.
void onEspNowReceive(const esp_now_recv_info_t *info, const uint8_t *data, int len) {
  if (len != sizeof(PoseSample)) {
    return; // ignore malformed/unexpected packets
  }
  memcpy(&secondarySample, data, sizeof(PoseSample));
  lastSecondaryRxMs = millis();
}

bool setupEspNowReceiver() {
  // ESP-NOW rides on the WiFi radio, but doesn't require being connected to
  // an access point -- station mode alone is enough for it to work
  // alongside the separate WiFi/MQTT connection this board also makes.
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    return false;
  }

  esp_now_register_recv_cb(onEspNowReceive);
  return true;
}

// True if we've heard from the secondary grip recently enough to trust it.
bool isSecondaryConnected() {
  return (millis() - lastSecondaryRxMs) < SECONDARY_TIMEOUT_MS;
}

#endif
