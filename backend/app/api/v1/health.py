from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT
    )

@router.get("/ping", tags=["System"], summary="Keepalive ping for Render free tier")
def ping():
    """
    Ultra-lightweight endpoint used by cron-job.org to prevent
    Render free tier from sleeping after 15 minutes of inactivity.
    Returns minimal JSON — no DB or config calls.
    """
    return {"pong": True}
