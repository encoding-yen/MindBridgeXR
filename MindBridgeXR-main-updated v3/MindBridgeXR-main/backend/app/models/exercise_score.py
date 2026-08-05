from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class ExerciseScore(Base):
    __tablename__ = "exercise_scores"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("assessment_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )

    exercise_number = Column(Integer, nullable=False)
    exercise_name = Column(String(150), nullable=False)

    score = Column(Integer, nullable=False, default=0)
    max_score = Column(Integer, nullable=False, default=3)

    posture_score = Column(Integer, nullable=True)
    control_score = Column(Integer, nullable=True)
    range_score = Column(Integer, nullable=True)
    speed_score = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())