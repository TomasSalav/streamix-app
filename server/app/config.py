from .extensions import db, cors, migrate
from dotenv import load_dotenv
import os

load_dotenv()

"""
    Database, Cors and Migrate configuration
"""

class Config:
    try:
        SECRET_KEY = os.getenv("SECRET_KEY")
        SQLALCHEMY_DATABASE_URI = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
        SQLALCHEMY_TRACK_MODIFICATIONS = False
    except Exception as e:
        print(f"Error loading configuration: {e}")