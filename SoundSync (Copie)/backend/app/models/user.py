from pydantic import BaseModel, EmailStr

class User(BaseModel):
    id: str | None = None
    email: EmailStr
    name: str
    role: str  

