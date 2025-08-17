# schemas.py
from pydantic import BaseModel, EmailStr

# Shared properties for a ToDo item.
class ToDoBase(BaseModel):
    title: str
    description: str | None = None

# Properties to receive on ToDo creation.
class ToDoCreate(ToDoBase):
    pass

# Properties to return to the client.
class ToDo(ToDoBase):
    id: int
    is_completed: bool
    owner_id: int

    # This tells Pydantic to handle SQLAlchemy model objects.
    class Config:
        from_attributes = True


# Shared properties for a User.
class UserBase(BaseModel):
    email: EmailStr

# Properties to receive on user creation (registration).
class UserCreate(UserBase):
    password: str

# Properties to return to the client for a single user.
class User(UserBase):
    id: int
    is_active: bool
    todos: list[ToDo] = []

    class Config:
        from_attributes = True