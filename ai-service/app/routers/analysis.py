from fastapi import APIRouter, HTTPException
from app.schemas.requests import EventArticlesInput, AskCrossViewRequest
from app.schemas.responses import (
    ConsolidatedReportResponse,
    PerspectiveComparisonResponse,
    ClaimAnalysisResponse,
    AskCrossViewResponse
)
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

@router.post("/consolidate", response_model=ConsolidatedReportResponse)
def consolidate_news(data: EventArticlesInput):
    if not data.articles:
        raise HTTPException(status_code=400, detail="Articles list cannot be empty")
    return gemini_service.consolidate_news(data.articles, event_id=data.event_id or "")

@router.post("/compare", response_model=PerspectiveComparisonResponse)
def compare_perspectives(data: EventArticlesInput):
    if not data.articles:
        raise HTTPException(status_code=400, detail="Articles list cannot be empty")
    return gemini_service.compare_perspectives(data.articles, event_id=data.event_id or "")

@router.post("/claims", response_model=ClaimAnalysisResponse)
def extract_claims(data: EventArticlesInput):
    if not data.articles:
        raise HTTPException(status_code=400, detail="Articles list cannot be empty")
    return gemini_service.analyze_claims(data.articles, event_id=data.event_id or "")

@router.post("/ask", response_model=AskCrossViewResponse)
def ask_crossview(data: AskCrossViewRequest):
    if not data.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return gemini_service.answer_question(
        question=data.question,
        articles=data.articles,
        event_title=data.event_title or "",
        existing_claims=data.existing_claims,
        consolidated_report=data.consolidated_report
    )

