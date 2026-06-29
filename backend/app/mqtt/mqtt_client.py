import json
import csv
from datetime import datetime

import paho.mqtt.client as mqtt

from app.mqtt.latest_data import latest_imu_data
from app.mqtt.active_session import active_session


MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "stingray/imu/data"


def append_sensor_data_to_csv(data):
    if not active_session["is_active"]:
        return

    csv_file_path = active_session["csv_file_path"]

    if not csv_file_path:
        return

    with open(csv_file_path, "a", newline="") as file:
        writer = csv.writer(file)

        writer.writerow([
            datetime.now().isoformat(),
            data.get("pitch", 0),
            data.get("roll", 0),
            data.get("yaw", 0),
            data.get("ax", 0),
            data.get("ay", 0),
            data.get("az", 0),
            data.get("gx", 0),
            data.get("gy", 0),
            data.get("gz", 0),
            data.get("mx", 0),
            data.get("my", 0),
            data.get("mz", 0),
        ])


def on_connect(client, userdata, flags, reason_code, properties=None):
    print("MQTT connected:", reason_code)
    client.subscribe(MQTT_TOPIC)
    print("Subscribed to:", MQTT_TOPIC)


def on_message(client, userdata, message):
    try:
        payload = message.payload.decode("utf-8")
        data = json.loads(payload)

        latest_imu_data.update({
            "pitch": float(data.get("pitch", 0)),
            "roll": float(data.get("roll", 0)),
            "yaw": float(data.get("yaw", 0)),
            "ax": float(data.get("ax", 0)),
            "ay": float(data.get("ay", 0)),
            "az": float(data.get("az", 0)),
            "gx": float(data.get("gx", 0)),
            "gy": float(data.get("gy", 0)),
            "gz": float(data.get("gz", 0)),
            "mx": float(data.get("mx", 0)),
            "my": float(data.get("my", 0)),
            "mz": float(data.get("mz", 0)),
            "connected": True,
        })

        append_sensor_data_to_csv(data)

    except Exception as error:
        print("MQTT message error:", error)


def start_mqtt_client():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

    print(f"Listening to MQTT topic: {MQTT_TOPIC}")