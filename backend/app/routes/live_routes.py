from fastapi import APIRouter
from app.mqtt.latest_data import latest_imu_data

router = APIRouter()


@router.get("/live-imu")
def get_live_imu():
    return latest_imu_data