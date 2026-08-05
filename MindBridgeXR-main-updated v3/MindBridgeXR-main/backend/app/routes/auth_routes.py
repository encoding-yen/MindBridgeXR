from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas.auth_schema import RegisterRequest, LoginRequest, UserResponse
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=UserResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, data)

    if user is None:
        raise HTTPException(status_code=400, detail="Email already registered")

    return user


@router.post("/login", response_model=UserResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = login_user(db, data)

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return user