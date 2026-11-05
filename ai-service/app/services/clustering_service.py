import math
import re
from datetime import datetime
from typing import List, Dict, Any, Tuple
import numpy as np
from app.config import settings
from app.services.embedding_service import embedding_service
from app.schemas.requests import ArticleInput
from app.schemas.responses import ClusterResult, ClusteringResponse

def parse_iso_date(date_str: str) -> datetime:
    if not date_str:
        return datetime.utcnow()
    try:
        # Remove trailing Z or parse standard ISO formats
        clean = date_str.replace("Z", "+00:00")
        return datetime.fromisoformat(clean)
    except Exception:
        return datetime.utcnow()

def extract_keywords(text: str) -> set:
    if not text:
        return set()
    # Extract alphanumeric words with 3+ characters, lowercased
    words = re.findall(r'[a-zA-Z0-9]{3,}', text.lower())
    # Basic stop words filtering
    stop_words = {
        'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'were', 'will',
        'what', 'when', 'where', 'which', 'about', 'after', 'said', 'says', 'news',
        'report', 'reports', 'stated', 'more', 'over', 'into', 'they', 'their'
    }
    return {w for w in words if w not in stop_words}

class ClusteringService:
    def __init__(self):
        self.default_threshold = settings.SIMILARITY_THRESHOLD

    def cluster_articles(
        self,
        articles: List[ArticleInput],
        threshold: float = None,
        time_window_hours: int = 72
    ) -> ClusteringResponse:
        if not articles:
            return ClusteringResponse(
                clusters=[],
                unclustered_article_ids=[],
                total_articles=0,
                total_clusters=0
            )

        threshold = threshold if threshold is not None else self.default_threshold

        # Step 1: Ensure embeddings exist for each article
        needs_embedding = []
        texts_to_embed = []
        for i, art in enumerate(articles):
            if not art.embedding or len(art.embedding) == 0:
                combined_text = f"{art.title}. {art.description or ''}"
                needs_embedding.append(i)
                texts_to_embed.append(combined_text)

        if texts_to_embed:
            generated_embeddings = embedding_service.encode(texts_to_embed)
            for idx, emb in zip(needs_embedding, generated_embeddings):
                articles[idx].embedding = emb

        embeddings_matrix = np.array([a.embedding for a in articles], dtype=np.float32)

        # Normalize matrix rows
        norms = np.linalg.norm(embeddings_matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        normed_matrix = embeddings_matrix / norms

        # Step 2: Compute pairwise Cosine Similarity
        cosine_sim = np.dot(normed_matrix, normed_matrix.T)

        n = len(articles)
        visited = set()
        clusters_list: List[List[int]] = []

        # Graph-based connected components or single-linkage with hybrid similarity
        for i in range(n):
            if i in visited:
                continue

            current_cluster = [i]
            visited.add(i)

            art_i = articles[i]
            date_i = parse_iso_date(art_i.published_at)
            keywords_i = extract_keywords(f"{art_i.title} {art_i.description or ''}")

            for j in range(i + 1, n):
                if j in visited:
                    continue

                art_j = articles[j]
                date_j = parse_iso_date(art_j.published_at)
                keywords_j = extract_keywords(f"{art_j.title} {art_j.description or ''}")

                # Date proximity check
                time_diff_hours = abs((date_i - date_j).total_seconds()) / 3600.0

                # Keyword overlap (Jaccard)
                overlap = len(keywords_i.intersection(keywords_j))
                union = len(keywords_i.union(keywords_j))
                keyword_jaccard = (overlap / union) if union > 0 else 0.0

                cos_score = float(cosine_sim[i, j])

                # Hybrid score: cosine + keyword bonus, with time penalty if beyond time window
                time_penalty = 0.0
                if time_diff_hours > time_window_hours:
                    time_penalty = min(0.25, (time_diff_hours - time_window_hours) / 100.0)

                keyword_boost = min(0.35, overlap * 0.12) if overlap >= 2 else 0.0
                hybrid_score = (0.60 * cos_score) + (0.40 * keyword_jaccard) + keyword_boost - time_penalty

                # Articles must satisfy either strong cosine sim or solid hybrid score
                if hybrid_score >= threshold or cos_score >= (threshold + 0.08) or (overlap >= 2 and keyword_jaccard >= 0.15 and time_diff_hours <= time_window_hours):
                    current_cluster.append(j)
                    visited.add(j)

            clusters_list.append(current_cluster)

        # Step 3: Format clusters and distinguish unclustered single articles
        results: List[ClusterResult] = []
        unclustered_ids: List[str] = []

        for cluster_indices in clusters_list:
            cluster_articles = [articles[idx] for idx in cluster_indices]
            article_ids = [a.id for a in cluster_articles]

            if len(cluster_articles) == 1:
                unclustered_ids.append(cluster_articles[0].id)
                # We can also still register it as a cluster if requested or leave it unclustered
                continue

            # Pick representative title & category
            # Pick the title with highest average similarity to cluster members
            sub_sims = cosine_sim[np.ix_(cluster_indices, cluster_indices)]
            centrality = np.mean(sub_sims, axis=1)
            best_idx = cluster_indices[int(np.argmax(centrality))]
            representative_title = articles[best_idx].title

            # Collect unique publishers
            publishers = {a.source_name for a in cluster_articles if a.source_name}
            source_count = max(len(publishers), len(cluster_articles))

            # Dates
            dates = [parse_iso_date(a.published_at) for a in cluster_articles]
            first_reported = min(dates).isoformat()
            last_updated = max(dates).isoformat()

            # Category preference: take majority category
            categories = [a.category for a in cluster_articles if a.category]
            category = max(set(categories), key=categories.count) if categories else "General"

            confidence = float(np.mean(centrality))

            cluster_id = f"evt_{min(article_ids)}_{int(datetime.utcnow().timestamp())}"

            results.append(ClusterResult(
                cluster_id=cluster_id,
                suggested_title=representative_title,
                category=category,
                article_ids=article_ids,
                source_count=source_count,
                first_reported_at=first_reported,
                last_updated_at=last_updated,
                confidence_score=round(confidence, 3)
            ))

        return ClusteringResponse(
            clusters=results,
            unclustered_article_ids=unclustered_ids,
            total_articles=len(articles),
            total_clusters=len(results)
        )

clustering_service = ClusteringService()

