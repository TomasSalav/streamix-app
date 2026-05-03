"""
Script de entrada para la aplicación Flask.
Espera a que PostgreSQL esté listo y crea las tablas si no existen.
"""
import sys
import time
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
import os

load_dotenv()


def wait_for_db(host, user, password, db_name, max_retries=30):
    """Espera a que la base de datos esté disponible."""
    print(f"Waiting for PostgreSQL at {host}...")
    
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(
                host=host,
                user=user,
                password=password,
                dbname='postgres',  # Conectar a la base de datos por defecto
                port=os.getenv('DB_PORT', '5432')
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            conn.close()
            print("PostgreSQL is ready!")
            return True
        except psycopg2.OperationalError as e:
            print(f"Retry {i+1}/{max_retries}: {e}")
            time.sleep(1)
    
    return False


def create_database_if_not_exists(host, user, password, db_name):
    """Crea la base de datos si no existe."""
    try:
        conn = psycopg2.connect(
            host=host,
            user=user,
            password=password,
            dbname='postgres',
            port=os.getenv('DB_PORT', '5432')
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Verificar si la base de datos existe
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Creating database '{db_name}'...")
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"Database '{db_name}' created!")
        else:
            print(f"Database '{db_name}' already exists.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")
        raise


def create_tables():
    """Crea todas las tablas."""
    from app import create_app
    from app.extensions import db
    
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Tables created successfully!")


if __name__ == "__main__":
    # Obtener variables de entorno
    DB_HOST = os.getenv('DB_HOST', 'db')
    DB_USER = os.getenv('DB_USER', 'streamix_user')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'streamix_password')
    DB_NAME = os.getenv('DB_NAME', 'streamix')
    DB_PORT = os.getenv('DB_PORT', '5432')
    
    # Esperar a que PostgreSQL esté disponible
    if not wait_for_db(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME):
        print("ERROR: Could not connect to PostgreSQL")
        sys.exit(1)
    
    # Crear la base de datos si no existe
    create_database_if_not_exists(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
    
    # Crear las tablas
    create_tables()
    
    # Ejecutar la aplicación
    print("Starting Flask application...")
    from app import create_app
    app = create_app()
    app.run(host="0.0.0.0", port=5050)