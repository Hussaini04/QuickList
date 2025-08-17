# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware

# Import our database, schemas, and CRUD functions
from database import SessionLocal
import crud, schemas, auth

app = FastAPI()

# Configure CORS settings
origins = [
    "http://localhost",
    "http://localhost:5173",  # The origin of your React app
]

# Add the CORS middleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from these origins
    allow_credentials=True, # Allow cookies and authorization headers
    allow_methods=["*"],    # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Allow all headers
)

# Dependency for managing database sessions
def get_db():
    """
    Provides a database session for each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint for user registration
@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user in QuickList.
    """
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Hash the password before sending it to the database
    hashed_password = auth.get_password_hash(user.password)
    
    return crud.create_user(db=db, user=user, hashed_password=hashed_password)

# Endpoint for user login and token generation
@app.post("/token", status_code=status.HTTP_200_OK)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Authenticates a user and returns a JWT access token.
    """
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/todos/", response_model=schemas.ToDo, status_code=status.HTTP_201_CREATED)
def create_todo_for_current_user(
    todo: schemas.ToDoCreate,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new to-do item for the authenticated user.
    """
    return crud.create_user_todo(db=db, todo=todo, user_id=current_user.id)

@app.get("/todos/", response_model=list[schemas.ToDo])
def read_todos_for_current_user(
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves all to-do items for the authenticated user.
    """
    todos = crud.get_todos(db, user_id=current_user.id)
    return todos