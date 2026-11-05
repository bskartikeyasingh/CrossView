from fastapi import APIRouter
from datetime import datetime
from app.config import settings
from app.services.embedding_service import embedding_service
from app.services.gemini_service import gemini_service

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CrossView AI Intelligence Microservice",
        "timestamp": datetime.utcnow().isoformat(),
        "embedding_model": settings.EMBEDDING_MODEL,
        "embedding_service_ready": embedding_service.model is not None,
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }

