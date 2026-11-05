import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    ALLOWED_BACKEND_ORIGIN: str = os.getenv("ALLOWED_BACKEND_ORIGIN", "http://localhost:5000")
    PORT: int = int(os.getenv("PORT", "8000"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.68"))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
