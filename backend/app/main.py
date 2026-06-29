from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import User, AssessmentSession, ImuReading
from app.models.exercise_score import ExerciseScore

from app.routes.live_routes import router as live_router
from app.routes.auth_routes import router as auth_router
from app.routes.session_routes import router as session_router
from app.mqtt.mqtt_client import start_mqtt_client

Base.metadata.create_all(bind=engine)

app = FastAPI(title="STINGRAY Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(live_router)
app.include_router(auth_router)
app.include_router(session_router)


@app.on_event("startup")
def startup_event():
    start_mqtt_client()


@app.get("/")
def root():
    return {"message": "STINGRAY backend is running"}