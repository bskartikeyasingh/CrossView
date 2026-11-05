from pydantic import BaseModel, Field
from typing import List, Optional

class EmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, description="List of texts to encode")

class ArticleInput(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    content: Optional[str] = ""
    source_name: Optional[str] = Field("", alias="sourceName")
    source_domain: Optional[str] = Field("", alias="sourceDomain")
    author: Optional[str] = ""
    published_at: Optional[str] = Field("", alias="publishedAt")
    url: Optional[str] = ""
    category: Optional[str] = ""
    embedding: Optional[List[float]] = None

    class Config:
        populate_by_name = True

class ClusteringRequest(BaseModel):
    articles: List[ArticleInput] = Field(..., min_items=1)
    threshold: Optional[float] = None
    time_window_hours: Optional[int] = 72

class EventArticlesInput(BaseModel):
    event_id: Optional[str] = Field("", alias="eventId")
    event_title: Optional[str] = Field("", alias="eventTitle")
    articles: List[ArticleInput] = Field(..., min_items=1)

    class Config:
        populate_by_name = True

class AskCrossViewRequest(BaseModel):
    question: str = Field(..., min_length=3)
    event_title: Optional[str] = Field("", alias="eventTitle")
    event_id: Optional[str] = Field("", alias="eventId")
    articles: List[ArticleInput] = Field(default_factory=list)
    existing_claims: Optional[List[dict]] = Field(default_factory=list, alias="existingClaims")
    consolidated_report: Optional[dict] = Field(default=None, alias="consolidatedReport")

    class Config:
        populate_by_name = True
