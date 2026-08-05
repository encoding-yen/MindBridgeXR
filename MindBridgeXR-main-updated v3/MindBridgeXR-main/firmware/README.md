# Stingray Smart Bar Firmware

The bar is built as two physically separate grips, each with its own ESP32 --
there is no wiring between them (the center shaft is hollow and carries
nothing). The two boards communicate over ESP-NOW.

## `primary/`
Flash this to the grip that should talk to WiFi/MQTT.
- Reads its own ICM-20948 (tilt/rotation) + VL53L0X (altitude)
- Drives its own vibration motor + LED segment
- Listens for the secondary grip's readings over ESP-NOW
- Publishes one merged MQTT payload matching the existing backend schema
  (`pitch/roll/yaw/ax../mz/altitude`), with the secondary grip's data
  appended as `_l`-suffixed fields (currently ignored by the backend until
  it's updated to store per-hand data -- safe to send either way)

## `secondary/`
Flash this to the other grip. No WiFi/MQTT -- it:
- Reads its own ICM-20948 + VL53L0X
- Drives its own vibration motor + LED segment, entirely locally
- Broadcasts its reading to the primary grip over ESP-NOW every ~100ms

## Before flashing
- ICM-20948 failing to init is still fatal (halts on boot) -- it's core to
  everything (tilt, vibration, LEDs). VL53L0X failing to init is **not**
  fatal -- the board logs a warning and keeps running with altitude simply
  unavailable (`0`/invalid), so you can bring up and test a grip with just
  the ESP32 + ICM-20948 before the ToF sensor is wired in.
- `primary/ESPNOW.h` uses the broadcast MAC (`FF:FF:FF:FF:FF:FF`) for
  simplicity. For a more reliable link, get the primary's real MAC via
  `WiFi.macAddress()` and hardcode it into `secondary/ESPNOW.h`'s
  `primaryMac[]` instead.
- `MAG_OFFSET_X/Y/Z` in each `config.h` are placeholder zeros -- run a
  proper hard-iron calibration on each board before trusting yaw readings.
- Required libraries (both boards): `Adafruit ICM20X`, `Adafruit Unified
  Sensor`, `Adafruit VL53L0X`. Primary additionally needs `PubSubClient`.
