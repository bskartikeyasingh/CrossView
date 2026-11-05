import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, embeddings, clustering, analysis

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("crossview-ai")

app = FastAPI(
    title="CrossView AI Intelligence Microservice",
    description="Multi-source clustering, perspective comparison, claim analysis and evidence-grounded news consolidation",
    version="1.0.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local dev and backend connections
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(embeddings.router)
app.include_router(clustering.router)
app.include_router(analysis.router)

@app.get("/")
def root():
    return {
        "service": "CrossView AI Intelligence Platform",
        "tagline": "See Every Side. Understand Every Story.",
        "status": "operational",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)

