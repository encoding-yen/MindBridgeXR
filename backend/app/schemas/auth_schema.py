from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    date_of_birth: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Updated UserResponse model to include last_login field
class UserResponse(BaseModel):
    id: int
    stingray_id: str
    full_name: str
    email: str
    date_of_birth: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    last_login: Optional[datetime] = None
    

    class Config:
        from_attributes = True