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
    # This relationship indicates that a User object can include a list of ToDo objects.
    # We set a default empty list to handle cases where a user has no todos.
    todos: list['ToDo'] = [] # Forward reference 'ToDo' for type hinting

    # Pydantic's Config class allows for additional configuration.
    class Config:
        # `from_attributes = True` (formerly `orm_mode = True`) tells Pydantic to
        # read data directly from ORM models (like SQLAlchemy models).
        from_attributes = True

# Schema for authentication tokens, used for login and signup responses.
class Token(BaseModel):
    access_token: str
    token_type: str