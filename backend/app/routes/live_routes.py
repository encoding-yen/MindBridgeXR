from time import time

from fastapi import APIRouter
from app.mqtt.latest_data import latest_imu_data

router = APIRouter()

# Keep in sync with STALE_THRESHOLD_MS on the frontend
STALE_THRESHOLD_SECONDS = 4

@router.get("/live-imu")
def get_live_imu():
    last_seen = latest_imu_data.get("last_seen")
    is_stale = last_seen is None or (time.time() - last_seen) > STALE_THRESHOLD_SECONDS

    return {
        **latest_imu_data,
        "connected": False if is_stale else latest_imu_data["connected"],
    }