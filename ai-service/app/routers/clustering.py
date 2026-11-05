from fastapi import APIRouter, HTTPException
from app.schemas.requests import ClusteringRequest
from app.schemas.responses import ClusteringResponse
from app.services.clustering_service import clustering_service

router = APIRouter(prefix="/api/clustering", tags=["Clustering"])

@router.post("", response_model=ClusteringResponse)
def cluster_articles(request: ClusteringRequest):
    if not request.articles:
        raise HTTPException(status_code=400, detail="Articles list cannot be empty")
    return clustering_service.cluster_articles(
        articles=request.articles,
        threshold=request.threshold,
        time_window_hours=request.time_window_hours or 72
    )
