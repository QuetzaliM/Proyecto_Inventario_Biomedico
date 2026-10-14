import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ProyectoModular")

client = None


@asynccontextmanager
async def lifespan(app):
    global client
    client = AsyncMongoClient(MONGODB_URL)
    await client.admin.command("ping")
    print("Conectado a MongoDB")
    yield
    await client.close()
    print("Conexión a MongoDB cerrada")


def get_database():
    return client[DATABASE_NAME]