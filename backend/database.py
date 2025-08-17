from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# This is the connection URL for our PostgreSQL database.
# It uses the credentials and host defined in our docker-compose.yml file.
# We are connecting to a database named 'quicklist_db' on 'localhost' port '5432'.
SQLALCHEMY_DATABASE_URL = "postgresql://quicklist_user:quicklist_password@localhost:5432/quicklist_db"

# `create_engine` establishes the connection to the database.
# The 'pool_pre_ping=True' parameter checks if the connection is active before
# using it, which helps prevent issues with dropped connections.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, pool_pre_ping=True
)

# `sessionmaker` creates a session class. This session will be our primary
# way to interact with the database (e.g., add new records, query data, delete items).
# `autocommit=False` means changes won't be saved automatically.
# `autoflush=False` prevents the session from automatically flushing changes to the DB.
# We will manually commit and close each session to ensure proper transaction management.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is a base class that our database models will inherit from.
# It provides the metadata needed by SQLAlchemy to create the database tables.
Base = declarative_base()