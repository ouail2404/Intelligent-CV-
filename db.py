import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME")

if not MONGO_URI:
    raise Exception("❌ MONGO_URI is missing in .env")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"🔥 MongoDB connected to database: {DB_NAME}")
