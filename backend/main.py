# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

# Import our database, schemas, and CRUD functions
from database import SessionLocal
import crud
import schemas
import auth

app = FastAPI()

# Configure CORS settings to allow requests from our React frontend.
# It's crucial for security to only allow known origins in a production environment.
origins = [
    "http://localhost",
    "http://localhost:5173",  # The origin of our React app
]

# Add the CORS middleware to the application.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Specifies the allowed origins.
    allow_credentials=True, # Allows cookies to be included in cross-origin requests.
    allow_methods=["*"],    # Allows all standard HTTP methods (GET, POST, PUT, DELETE, etc.).
    allow_headers=["*"],    # Allows all HTTP headers.
)

# Dependency for managing database sessions.
# This function creates a new SQLAlchemy session for each request and
# ensures it's closed properly afterward, preventing resource leaks.
def get_db():
    db = SessionLocal()
    try:
        # 'yield' makes this a context manager; the session is available
        # until the endpoint function finishes.
        yield db
    finally:
        # Ensures the database session is closed, even if errors occur.
        db.close()

# Endpoint for user registration (signup).
@app.post("/users/", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user in QuickList and returns an access token.

    - **user**: The user data (email and password) to be registered.
    - **db**: The database session, provided by the `get_db` dependency.
    """
    # Check if a user with the provided email already exists.
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        # If the email is already registered, raise an HTTP 409 Conflict error.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Hash the user's password using the utility function from 'auth.py'
    # before storing it in the database for security.
    hashed_password = auth.get_password_hash(user.password)
    
    # Create the new user record in the database.
    crud.create_user(db=db, user=user, hashed_password=hashed_password)
    
    # After successful registration, immediately create an access token for the new user.
    access_token = auth.create_access_token(data={"sub": user.email})
    
    # Return the access token and token type as defined by the Token schema.
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint for user login and token generation.
@app.post("/token", status_code=status.HTTP_200_OK)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Authenticates a user and returns a JWT access token.
    """
    # Retrieve the user from the database by email.
    user = crud.get_user_by_email(db, email=form_data.username)
    
    # Verify if the user exists and if the provided password matches the hashed password.
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        # If authentication fails, raise an HTTP 401 Unauthorized error.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}, # Standard header for OAuth2
        )
    
    # If authentication is successful, create an access token.
    access_token = auth.create_access_token(data={"sub": user.email})
    
    # Return the access token and token type.
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint to create a new to-do item for the authenticated user.
@app.post("/todos/", response_model=schemas.ToDo, status_code=status.HTTP_201_CREATED)
def create_todo_for_current_user(
    todo: schemas.ToDoCreate,
    # This dependency ensures only authenticated users can access this endpoint.
    # It extracts the user's information from the JWT token.
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new to-do item for the authenticated user.
    """
    # Create the to-do item in the database, associating it with the current user's ID.
    return crud.create_user_todo(db=db, todo=todo, user_id=current_user.id)

# Endpoint to retrieve all to-do items for the authenticated user.
@app.get("/todos/", response_model=list[schemas.ToDo])
def read_todos_for_current_user(
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves all to-do items for the authenticated user.
    """
    # Fetch all to-do items associated with the current user's ID.
    todos = crud.get_todos(db, user_id=current_user.id)
    return todos

# Endpoint to delete a to-do item for the authenticated user.
@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_for_current_user(
    todo_id: int,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a to-do item for the authenticated user.
    """
    # Verify the to-do item exists and belongs to the authenticated user.
    db_todo = db.query(models.ToDo).filter(
        models.ToDo.id == todo_id,
        models.ToDo.owner_id == current_user.id
    ).first()

    # If the to-do item is not found or doesn't belong to the user, raise an error.
    if not db_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="To-do item not found or does not belong to the user"
        )
    
    # Delete the to-do item from the database.
    crud.delete_todo(db, todo_id)
    # Return an empty response with a 204 No Content status code, indicating success.
    return {"message": "To-do item deleted successfully"}