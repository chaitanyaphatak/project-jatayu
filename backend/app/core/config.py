from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Jatayu API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Auth (Clerk)
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_SECRET_KEY: str = ""
    CLERK_PEM_PUBLIC_KEY: str = ""
    
    # Weather
    OPENWEATHER_API_KEY: str = ""
    WEATHERAPI_COM_KEY: str = ""
    INDIANAPI_KEY: str = ""
    USE_MOCK_FALLBACK: bool = True
    
    # LLM
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Hugging Face
    HUGGINGFACE_API_TOKEN: str = ""
    
    # Maps
    MAPBOX_ACCESS_TOKEN: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
