from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class ImuReading(Base):
    __tablename__ = "imu_readings"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("assessment_sessions.id"), nullable=True)
    session_code = Column(String(100), nullable=True)

    pitch = Column(Float, nullable=False, default=0)
    roll = Column(Float, nullable=False, default=0)
    yaw = Column(Float, nullable=False, default=0)

    ax = Column(Float, nullable=False, default=0)
    ay = Column(Float, nullable=False, default=0)
    az = Column(Float, nullable=False, default=0)

    gx = Column(Float, nullable=False, default=0)
    gy = Column(Float, nullable=False, default=0)
    gz = Column(Float, nullable=False, default=0)

    mx = Column(Float, nullable=False, default=0)
    my = Column(Float, nullable=False, default=0)
    mz = Column(Float, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())