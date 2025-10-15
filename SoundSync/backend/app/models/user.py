from pydantic import BaseModel, EmailStr

class User(BaseModel):
    id: str | None = None
    email: EmailStr
    username: str
    password: str  # à chiffrer plus tard

