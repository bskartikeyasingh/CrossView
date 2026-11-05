from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    dimensions: int
    model: str

class ClusterResult(BaseModel):
    cluster_id: str
    suggested_title: str
    category: str
    article_ids: List[str]
    source_count: int
    first_reported_at: str
    last_updated_at: str
    confidence_score: float

class ClusteringResponse(BaseModel):
    clusters: List[ClusterResult]
    unclustered_article_ids: List[str]
    total_articles: int
    total_clusters: int

class ComparisonSection(BaseModel):
    topic: str
    description: str
    sources: List[str]

class DifferenceItem(BaseModel):
    aspect: str
    perspectives: List[Dict[str, str]]  # e.g. [{"source": "BBC", "framing": "Focuses on economic cost"}]
    analysis: str

class ConflictingClaim(BaseModel):
    topic: str
    conflicting_points: List[Dict[str, str]]  # e.g. [{"source": "Reuters", "stated": "12 casualties"}, {"source": "AP", "stated": "8 casualties"}]
    dispute_nature: str

class PerspectiveComparisonResponse(BaseModel):
    event_id: Optional[str] = ""
    summary: str
    shared_information: List[ComparisonSection]
    different_reporting: List[DifferenceItem]
    conflicting_claims: List[ConflictingClaim]
    analyzed_sources_count: int
    sources: List[Dict[str, str]]

class ExtractedClaim(BaseModel):
    claim_text: str
    claim_type: str = "factual"  # factual, quote, statistic, policy, assertion
    supporting_sources: List[Dict[str, str]]  # [{"sourceName": "...", "articleId": "...", "url": "..."}]
    contradicting_sources: List[Dict[str, str]]
    evidence_summary: str
    evidence_status: str  # "Corroborated by multiple independent sources", "Supported by one available source", "Disputed by available reports", "Unverified or insufficient evidence"
    confidence_score: float

class ClaimAnalysisResponse(BaseModel):
    event_id: Optional[str] = ""
    claims: List[ExtractedClaim]
    total_claims: int
    corroborated_count: int
    disputed_count: int

class SourceReference(BaseModel):
    source_name: str
    source_domain: Optional[str] = ""
    title: str
    url: str
    published_at: Optional[str] = ""

class ConsolidatedReportResponse(BaseModel):
    event_id: Optional[str] = ""
    headline: str
    overview: str
    what_happened: str
    shared_information: List[str]
    differences: List[str]
    disputed_claims: List[str]
    missing_context: List[str]
    event_context: str
    source_references: List[SourceReference]
    generated_at: str
    model: str
    report_version: str = "1.0"
    disclaimer: str = (
        "AI-generated consolidated report based on available source material. "
        "This report is a synthesis of published coverage and is not independently verified journalism."
    )

class Citation(BaseModel):
    source_name: str
    url: str
    published_at: Optional[str] = ""
    context: str

class AskCrossViewResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence_level: str
    unanswered_aspects: Optional[str] = None
    synthesized_from_sources_count: int

