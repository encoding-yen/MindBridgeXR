#ifndef WIFI_HTTP_H
#define WIFI_HTTP_H

#include <WiFi.h>
#include <HTTPClient.h>
#include "config.h"

// Blocks until connected, retrying every 20s if it times out.
void setupWiFi() {
  Serial.println("[NET] Connecting to Wi-Fi...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED) {
    vTaskDelay(pdMS_TO_TICKS(250));
    Serial.print(".");
    if (millis() - t0 > 20000) {
      Serial.println("\n[NET] Wi-Fi connect timeout, retrying...");
      WiFi.disconnect(true);
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      t0 = millis();
    }
  }
  Serial.print("\n[NET] Wi-Fi connected. IP: ");
  Serial.println(WiFi.localIP());
}

// Attempts a reconnect with a 10s timeout. Returns true if connected
// (either already was, or reconnect succeeded).
bool wifiEnsureConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  Serial.println("[NET] Wi-Fi lost; reconnecting...");
  WiFi.disconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    vTaskDelay(pdMS_TO_TICKS(200));
  }
  return WiFi.status() == WL_CONNECTED;
}

// POSTs a pose sample as JSON. Returns the HTTP status code (or a negative
// error code from HTTPClient on failure).
int postPoseSample(const PoseSample &s) {
  String body;
  body.reserve(128);
  body  = "{\"pitch\":\""; body += String(s.pitch, 1);
  body += "\",\"yaw\":\"";  body += String(s.yaw,   1);
  body += "\",\"roll\":\""; body += String(s.roll,  1);
  body += "\",\"altitude\":\""; body += String(s.altitude, 1);
  body += "\"}";

  HTTPClient http;
  http.begin(POST_URL);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST((uint8_t*)body.c_str(), body.length());

  if (code > 0 && code / 100 == 2) {
    Serial.print("[NET] POST OK (");
    Serial.print(code);
    Serial.print(") ");
    Serial.println(body);
  } else {
    Serial.print("[NET] POST FAIL (");
    Serial.print(code);
    Serial.println(")");
  }

  http.end();
  return code;
}

#endif