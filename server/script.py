import psycopg2
import os

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
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
try:
    cursor.execute(f"CREATE DATABASE {DB_NAME};")
except Exception as e:
    print(f"ERROR: {e}")
    exit(1)
print("LOGS: Database created successfully")
cursor.close()
conn.close()