from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

from contextlib import asynccontextmanager
from app.services.supabase_service import SupabaseService

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await SupabaseService.seed_initial_data_if_empty()
    except Exception as e:
        print(f"Startup Supabase seed notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Conversational AI for Weather Forecasting, Alerts & Climate Intelligence",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1
app.include_router(api_router, prefix="/api/v1")

@app.get("/api/wind-grid")
async def get_wind_grid_alias():
    from app.services.weather_service import WeatherService
    return await WeatherService.get_wind_grid()

@app.get("/")
def root():
    return {
        "message": "Welcome to Jatayu API",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
