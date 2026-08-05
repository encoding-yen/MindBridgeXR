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

bool mqttEnsureConnected() {
  if (mqttClient.connected()) {
    return false;
  }

  while (!mqttClient.connected()) {
    Serial.print("[NET] Connecting to MQTT... ");
    String clientId = "ESP32S3_STINGRAY_PRIMARY_";
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

// Publishes this grip's reading as the "main" payload (field names match
// what the backend already understands -- pitch/roll/yaw/ax..mz/altitude),
// plus the secondary grip's reading appended with "_l" suffixes.
//
// The backend parses with data.get(...), so the _l fields are simply
// ignored until the backend/DB model is updated to store per-hand data --
// this is safe to send today, it just won't show up anywhere yet.
//
// If the secondary grip hasn't been heard from recently, secondaryOnline
// is false and altitude_l/pitch_l/etc are omitted rather than sent as
// stale/zeroed values that could be mistaken for real readings.
void publishMergedSample(const PoseSample &primary, const PoseSample &secondary, bool secondaryOnline) {
  char payload[420];

  int written = snprintf(payload, sizeof(payload),
    "{\"pitch\":%.2f,\"roll\":%.2f,\"yaw\":%.2f,"
    "\"ax\":%.4f,\"ay\":%.4f,\"az\":%.4f,"
    "\"gx\":%.4f,\"gy\":%.4f,\"gz\":%.4f,"
    "\"mx\":%.2f,\"my\":%.2f,\"mz\":%.2f,"
    "\"altitude\":%.1f,"
    "\"secondary_connected\":%s",
    primary.pitch, primary.roll, primary.yaw,
    primary.ax, primary.ay, primary.az,
    primary.gx, primary.gy, primary.gz,
    primary.mx, primary.my, primary.mz,
    primary.altitude,
    secondaryOnline ? "true" : "false");

  if (secondaryOnline && written > 0 && written < (int)sizeof(payload)) {
    snprintf(payload + written, sizeof(payload) - written,
      ",\"pitch_l\":%.2f,\"roll_l\":%.2f,\"yaw_l\":%.2f,"
      "\"ax_l\":%.4f,\"ay_l\":%.4f,\"az_l\":%.4f,"
      "\"gx_l\":%.4f,\"gy_l\":%.4f,\"gz_l\":%.4f,"
      "\"mx_l\":%.2f,\"my_l\":%.2f,\"mz_l\":%.2f,"
      "\"altitude_l\":%.1f}",
      secondary.pitch, secondary.roll, secondary.yaw,
      secondary.ax, secondary.ay, secondary.az,
      secondary.gx, secondary.gy, secondary.gz,
      secondary.mx, secondary.my, secondary.mz,
      secondary.altitude);
  } else {
    strncat(payload, "}", sizeof(payload) - strlen(payload) - 1);
  }

  Serial.println(payload);
  mqttClient.publish(MQTT_TOPIC, payload);
}

#endif
