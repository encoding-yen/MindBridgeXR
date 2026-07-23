#ifndef MQTT_H
#define MQTT_H

#include <WiFi.h>
#include <PubSubClient.h>
#include "config.h"

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setupWiFi() {
  Serial.print("[NET] Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("[NET] WiFi Connected");
  Serial.print("[NET] IP Address: ");
  Serial.println(WiFi.localIP());
}

void setupMQTT() {
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

// Blocks until MQTT is (re)connected. Returns true if a reconnect actually
// happened, so the caller can reset any elapsed-time bookkeeping that
// shouldn't include the blocking/reconnect stall.
bool mqttEnsureConnected() {
  if (mqttClient.connected()) {
    return false;
  }

  while (!mqttClient.connected()) {
    Serial.print("[NET] Connecting to MQTT... ");
    String clientId = "ESP32S3_STINGRAY_";
    clientId += String(random(0xffff), HEX);

    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("MQTT Connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }

  return true;
}

inline void mqttLoop() {
  mqttClient.loop();
}

// Publishes one PoseSample as JSON on MQTT_TOPIC, matching the exact field
// set the backend's mqtt_client.py reads (pitch..mz). "altitude" is appended
// on top -- the backend parses with data.get(...), so an unrecognized extra
// field is simply ignored rather than causing an error. It won't show up
// anywhere in the dashboard/DB until the backend/DB model is updated to
// actually store it, but it won't break the existing pipeline either.
void publishPoseSample(const PoseSample &s) {
  char payload[280];
  snprintf(payload, sizeof(payload),
    "{\"pitch\":%.2f,\"roll\":%.2f,\"yaw\":%.2f,"
    "\"ax\":%.4f,\"ay\":%.4f,\"az\":%.4f,"
    "\"gx\":%.4f,\"gy\":%.4f,\"gz\":%.4f,"
    "\"mx\":%.2f,\"my\":%.2f,\"mz\":%.2f,"
    "\"altitude\":%.1f}",
    s.pitch, s.roll, s.yaw,
    s.ax, s.ay, s.az,
    s.gx, s.gy, s.gz,
    s.mx, s.my, s.mz,
    s.altitude);

  Serial.println(payload);
  mqttClient.publish(MQTT_TOPIC, payload);
}

#endif