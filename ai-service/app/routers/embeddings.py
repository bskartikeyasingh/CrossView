from fastapi import APIRouter, HTTPException
from app.schemas.requests import EmbeddingRequest
from app.schemas.responses import EmbeddingResponse
from app.services.embedding_service import embedding_service
from app.config import settings

router = APIRouter(prefix="/api/embeddings", tags=["Embeddings"])

@router.post("", response_model=EmbeddingResponse)
def generate_embeddings(request: EmbeddingRequest):
    if not request.texts:
        raise HTTPException(status_code=400, detail="Text list cannot be empty")
    embeddings = embedding_service.encode(request.texts)
    dims = len(embeddings[0]) if embeddings else 384
    return EmbeddingResponse(
        embeddings=embeddings,
        dimensions=dims,
        model=settings.EMBEDDING_MODEL
    )

