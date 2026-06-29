from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(Integer, primary_key=True, index=True)

    session_code = Column(String(100), unique=True, nullable=False)
    session_number = Column(Integer, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    csv_file_path = Column(String(255), nullable=True)

    total_score = Column(Integer, nullable=True, default=0)
    max_score = Column(Integer, nullable=False, default=21)
    score_percentage = Column(Float, nullable=True, default=0)

    risk_level = Column(String(50), nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    status = Column(String(50), nullable=False, default="active")

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)