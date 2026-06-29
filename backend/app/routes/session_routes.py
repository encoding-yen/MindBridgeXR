import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import csv

from app.database import SessionLocal
from app.models.user import User
from app.models.assessment_session import AssessmentSession
from app.mqtt.active_session import active_session
from typing import List, Optional
from app.models.exercise_score import ExerciseScore

router = APIRouter(prefix="/sessions", tags=["Sessions"])


class StartSessionRequest(BaseModel):
    user_id: int


class ExerciseScoreRequest(BaseModel):
    exercise_number: int
    exercise_name: str
    score: int
    max_score: int = 3
    posture_score: Optional[int] = None
    control_score: Optional[int] = None
    range_score: Optional[int] = None
    speed_score: Optional[int] = None


class EndSessionRequest(BaseModel):
    session_id: int
    total_score: int = 0
    exercise_scores: List[ExerciseScoreRequest] = []

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def calculate_risk(total_score: int) -> str:
    if total_score >= 17:
        return "Low"
    if total_score >= 10:
        return "Moderate"
    return "High"


@router.post("/start")
def start_session(data: StartSessionRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    previous_sessions_count = (
        db.query(AssessmentSession)
        .filter(AssessmentSession.user_id == user.id)
        .count()
    )

    session_number = previous_sessions_count + 1
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    session_code = f"{user.stingray_id}_SESSION_{session_number:04d}_{timestamp}"

    user_folder = os.path.join("raw_data", user.stingray_id)
    os.makedirs(user_folder, exist_ok=True)
    csv_file_path = os.path.join(user_folder, f"{session_code}.csv")
    
    with open(csv_file_path, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            "timestamp",
            "pitch",
            "roll",
            "yaw",
            "ax",
            "ay",
            "az",
            "gx",
            "gy",
            "gz",
            "mx",
            "my",
            "mz",
        ])
        

    new_session = AssessmentSession(
        session_code=session_code,
        session_number=session_number,
        user_id=user.id,
        csv_file_path=csv_file_path,
        total_score=0,
        max_score=21,
        score_percentage=0,
        risk_level=None,
        duration_seconds=0,
        status="active",
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    active_session["session_id"] = new_session.id
    active_session["session_code"] = new_session.session_code
    active_session["csv_file_path"] = new_session.csv_file_path
    active_session["is_active"] = True
        

    return {
        "id": new_session.id,
        "session_code": new_session.session_code,
        "session_number": new_session.session_number,
        "user_id": new_session.user_id,
        "csv_file_path": new_session.csv_file_path,
        "status": new_session.status,
    }


@router.post("/end")
def end_session(data: EndSessionRequest, db: Session = Depends(get_db)):
    session = (
        db.query(AssessmentSession)
        .filter(AssessmentSession.id == data.session_id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    now = datetime.now(timezone.utc)

    duration_seconds = 0
    if session.started_at:
        duration_seconds = int((now - session.started_at).total_seconds())

    session.total_score = data.total_score
    session.score_percentage = round((data.total_score / session.max_score) * 100, 2)
    session.risk_level = calculate_risk(data.total_score)
    session.duration_seconds = duration_seconds
    session.status = "completed"
    session.ended_at = now

    db.query(ExerciseScore).filter(
        ExerciseScore.session_id == session.id
    ).delete()

    for exercise in data.exercise_scores:
        new_exercise_score = ExerciseScore(
            session_id=session.id,
            exercise_number=exercise.exercise_number,
            exercise_name=exercise.exercise_name,
            score=exercise.score,
            max_score=exercise.max_score,
            posture_score=exercise.posture_score,
            control_score=exercise.control_score,
            range_score=exercise.range_score,
            speed_score=exercise.speed_score,
        )

        db.add(new_exercise_score)

    db.commit()
    db.refresh(session)

    active_session["session_id"] = None
    active_session["session_code"] = None
    active_session["csv_file_path"] = None
    active_session["is_active"] = False

    return {
        "id": session.id,
        "session_code": session.session_code,
        "total_score": session.total_score,
        "max_score": session.max_score,
        "score_percentage": session.score_percentage,
        "risk_level": session.risk_level,
        "duration_seconds": session.duration_seconds,
        "status": session.status,
    }


@router.get("/user/{user_id}")
def get_user_sessions(user_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(AssessmentSession)
        .filter(AssessmentSession.user_id == user_id)
        .order_by(AssessmentSession.started_at.desc())
        .all()
    )

    return sessions


@router.get("/latest/{user_id}")
def get_latest_completed_session(user_id: int, db: Session = Depends(get_db)):
    session = (
        db.query(AssessmentSession)
        .filter(
            AssessmentSession.user_id == user_id,
            AssessmentSession.status == "completed",
        )
        .order_by(AssessmentSession.ended_at.desc())
        .first()
    )

    if not session:
        return None

    return session


@router.get("/stats/{user_id}")
def get_user_session_stats(user_id: int, db: Session = Depends(get_db)):
    completed_sessions = (
        db.query(AssessmentSession)
        .filter(
            AssessmentSession.user_id == user_id,
            AssessmentSession.status == "completed",
        )
        .order_by(AssessmentSession.started_at.asc())
        .all()
    )

    if not completed_sessions:
        return {
            "sessions_completed": 0,
            "latest_score": 0,
            "best_score": 0,
            "current_risk_level": "No Data",
            "improvement": 0,
        }

    first_score = completed_sessions[0].total_score or 0
    latest_score = completed_sessions[-1].total_score or 0
    best_score = max(session.total_score or 0 for session in completed_sessions)

    improvement = latest_score - first_score

    return {
        "sessions_completed": len(completed_sessions),
        "latest_score": latest_score,
        "best_score": best_score,
        "current_risk_level": completed_sessions[-1].risk_level,
        "improvement": improvement,
    }

@router.get("/{session_id}/exercise-scores")
def get_session_exercise_scores(session_id: int, db: Session = Depends(get_db)):
    scores = (
        db.query(ExerciseScore)
        .filter(ExerciseScore.session_id == session_id)
        .order_by(ExerciseScore.exercise_number.asc())
        .all()
    )

    return scores