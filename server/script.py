import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD", 2007)
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", 5432)

conn = psycopg2.connect(
    dbname="postgres",
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)

conn.autocommit = True
cursor = conn.cursor()
def create_database():
    try:
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (DB_NAME,))
        exists = cursor.fetchone()
        if exists:
            return
        cursor.execute(
            sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME))
        )
        cursor.close()
        conn.close()
        print("LOGS: Database created successfully")
    except Exception as e:
        print(f"ERROR: {e}")
        exit(1)
    
create_database()
    
