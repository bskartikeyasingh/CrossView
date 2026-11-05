import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.routers.health import health_check
from app.routers.embeddings import generate_embeddings
from app.routers.clustering import cluster_articles
from app.routers.analysis import consolidate_news, compare_perspectives, extract_claims, ask_crossview
from app.schemas.requests import (
    EmbeddingRequest,
    ClusteringRequest,
    ArticleInput,
    EventArticlesInput,
    AskCrossViewRequest
)

def test_health():
    res = health_check()
    assert res["status"] == "healthy"
    assert "embedding_model" in res

def test_embeddings():
    req = EmbeddingRequest(texts=["Global diplomatic summit begins in Geneva", "Economic forecasts show growth"])
    res = generate_embeddings(req)
    assert len(res.embeddings) == 2
    assert res.dimensions == 384

def test_clustering():
    articles = [
        ArticleInput(
            id="art_1",
            title="Geneva Accord Reached on Carbon Emissions",
            description="Delegates in Geneva agreed to new limits.",
            sourceName="Reuters",
            publishedAt="2026-11-05T10:00:00Z",
            category="Climate"
        ),
        ArticleInput(
            id="art_2",
            title="Carbon Targets Agreed at Geneva Summit",
            description="Nations unite in Geneva to curb climate impact.",
            sourceName="AP News",
            publishedAt="2026-11-05T11:00:00Z",
            category="Climate"
        ),
        ArticleInput(
            id="art_3",
            title="Championship Match Ends with Historic Victory",
            description="Football fans celebrated a dramatic overtime goal.",
            sourceName="Sports Daily",
            publishedAt="2026-11-05T12:00:00Z",
            category="Sports"
        )
    ]
    req = ClusteringRequest(articles=articles, threshold=0.5)
    res = cluster_articles(req)
    assert res.total_articles == 3
    assert len(res.clusters) >= 1

def test_consolidation():
    articles = [
        ArticleInput(
            id="art_1",
            title="Geneva Accord Reached on Carbon Emissions",
            description="Delegates in Geneva agreed to new limits.",
            sourceName="Reuters",
            publishedAt="2026-11-05T10:00:00Z",
            category="Climate"
        ),
        ArticleInput(
            id="art_2",
            title="Carbon Targets Agreed at Geneva Summit",
            description="Nations unite in Geneva to curb climate impact.",
            sourceName="AP News",
            publishedAt="2026-11-05T11:00:00Z",
            category="Climate"
        )
    ]
    req = EventArticlesInput(eventId="evt_test_1", articles=articles)
    res = consolidate_news(req)
    assert res.headline is not None
    assert len(res.shared_information) >= 1
    assert "AI-generated" in res.disclaimer

def test_comparison():
    articles = [
        ArticleInput(
            id="art_1",
            title="Geneva Accord Reached on Carbon Emissions",
            description="Delegates in Geneva agreed to new limits.",
            sourceName="Reuters",
            publishedAt="2026-11-05T10:00:00Z"
        ),
        ArticleInput(
            id="art_2",
            title="Carbon Targets Agreed at Geneva Summit",
            description="Nations unite in Geneva to curb climate impact.",
            sourceName="AP News",
            publishedAt="2026-11-05T11:00:00Z"
        )
    ]
    req = EventArticlesInput(eventId="evt_test_1", articles=articles)
    res = compare_perspectives(req)
    assert len(res.shared_information) >= 1
    assert len(res.different_reporting) >= 1

def test_ask():
    articles = [
        ArticleInput(
            id="art_1",
            title="Geneva Accord Reached on Carbon Emissions",
            description="Delegates in Geneva agreed to new limits.",
            sourceName="Reuters",
            publishedAt="2026-11-05T10:00:00Z"
        )
    ]
    req = AskCrossViewRequest(
        question="What happened in Geneva?",
        eventTitle="Geneva Accord",
        articles=articles
    )
    res = ask_crossview(req)
    assert res.answer is not None
    assert len(res.citations) >= 1

if __name__ == "__main__":
    print("Testing health...")
    test_health()
    print("✓ Health endpoint passed")
    print("Testing embeddings generation (SentenceTransformer all-MiniLM-L6-v2)...")
    test_embeddings()
    print("✓ Embeddings generation passed (384 dimensions)")
    print("Testing semantic event clustering...")
    test_clustering()
    print("✓ Semantic clustering passed")
    print("Testing multi-source consolidation...")
    test_consolidation()
    print("✓ Multi-source consolidation passed")
    print("Testing perspective comparison...")
    test_comparison()
    print("✓ Perspective comparison passed")
    print("Testing Ask CrossView grounded Q&A...")
    test_ask()
    print("✓ Ask CrossView Q&A passed")
    print("\nALL AI MICROSERVICE TESTS PASSED SUCCESSFULLY!")
