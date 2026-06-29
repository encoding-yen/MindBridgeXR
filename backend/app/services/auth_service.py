from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.user import User

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def generate_stingray_id(db: Session) -> str:
    last_user = db.query(User).order_by(User.id.desc()).first()
    next_number = 124 if last_user is None else last_user.id + 124
    return f"STG-{next_number:05d}"


def register_user(db: Session, data):
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        return None

    new_user = User(
        stingray_id=generate_stingray_id(db),
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        date_of_birth=data.date_of_birth,
        height_cm=data.height_cm,
        weight_kg=data.weight_kg,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(db: Session, data):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return None

    if not verify_password(data.password, user.password_hash):
        return None

    return user