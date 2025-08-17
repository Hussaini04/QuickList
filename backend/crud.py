# crud.py

from sqlalchemy.orm import Session

import models, schemas

# This function will handle creating a user in the database.
def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    # We now use the hashed password passed from the endpoint
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# This function queries the database for a user by their email.
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user_todo(db: Session, todo: schemas.ToDoCreate, user_id: int):
    """
    Creates a new to-do item for a specific user.
    """
    db_todo = models.ToDo(**todo.dict(), owner_id=user_id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def get_todos(db: Session, user_id: int):
    """
    Retrieves all to-do items for a specific user.
    """
    return db.query(models.ToDo).filter(models.ToDo.owner_id == user_id).all()