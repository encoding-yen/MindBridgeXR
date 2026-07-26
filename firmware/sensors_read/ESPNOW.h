#ifndef ESPNOW_H
#define ESPNOW_H

#include <esp_now.h>
#include <WiFi.h>
#include "config.h"

// Broadcast address -- sends to any listening device rather than a specific
// MAC. Simplest to get working first. For production, swap this for the
// primary grip's actual MAC (printed via WiFi.macAddress() on that board)
// and use esp_now_add_peer with a unicast address -- broadcast is fine for
// prototyping but is unencrypted and slightly less reliable than unicast.
uint8_t primaryMac[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

bool setupEspNowSender() {
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    return false;
  }

  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, primaryMac, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    return false;
  }

  return true;
}

void sendSampleToPrimary(const PoseSample &s) {
  esp_now_send(primaryMac, (const uint8_t*)&s, sizeof(PoseSample));
}

#endif
