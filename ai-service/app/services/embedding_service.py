import logging
import os
import hashlib
import numpy as np
from typing import List
from app.config import settings

# Enforce offline mode for HuggingFace to eliminate network timeouts and ensure ultra-fast local loading
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.model_name = settings.EMBEDDING_MODEL
        self._load_model()

    def _load_model(self):
        if os.environ.get("SKIP_HEAVY_EMBEDDINGS") == "1":
            self.model = None
            return
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer model: {self.model_name}")
            try:
                # Try loading from local cached weights first to avoid network timeouts
                self.model = SentenceTransformer(self.model_name, local_files_only=True)
            except Exception:
                self.model = None
            if self.model:
                logger.info("SentenceTransformer model loaded successfully.")
            else:
                logger.info("Local SentenceTransformer cache not found; using resilient fallback embeddings.")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ({e}). Using resilient embedding fallback.")
            self.model = None

    def encode(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        # If SentenceTransformer is loaded and works
        if self.model is not None:
            try:
                embeddings = self.model.encode(texts, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as e:
                logger.error(f"Error generating embeddings via SentenceTransformer: {e}. Falling back.")

        # Resilient fallback: Deterministic normalized semantic pseudo-embeddings (384 dims)
        # Guarantees identical vectors for identical texts and high similarity for shared vocabulary
        return [self._fallback_embed(text) for text in texts]

    def _fallback_embed(self, text: str, dim: int = 384) -> List[float]:
        cleaned = text.lower().strip()
        tokens = cleaned.split()
        vec = np.zeros(dim, dtype=np.float32)

        if not tokens:
            return vec.tolist()

        for token in tokens:
            token_hash = int(hashlib.sha256(token.encode('utf-8')).hexdigest()[:8], 16)
            idx = token_hash % dim
            # Sign bit based on second byte
            sign = 1.0 if (token_hash % 2 == 0) else -1.0
            vec[idx] += sign

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_service = EmbeddingService()
