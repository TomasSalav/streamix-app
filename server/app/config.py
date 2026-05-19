from .extensions import db, cors, migrate
from dotenv import load_dotenv
import os
load_dotenv()
"""
    Configuración de la base de datos
"""
class Config:
    try:
        SECRET_KEY = os.getenv("SECRET_KEY")
        DB_PORT = os.getenv("DB_PORT", "5432")
        SQLALCHEMY_DATABASE_URI = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{DB_PORT}/{os.getenv('DB_NAME')}"
        SQLALCHEMY_TRACK_MODIFICATIONS = False
        MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB limit for video uploads
    except Exception as e:
        print(f"Error cargando la configuración: {e}")
