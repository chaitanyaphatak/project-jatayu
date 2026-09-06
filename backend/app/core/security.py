from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
import base64
from typing import Optional, Dict, Any
from app.core.config import settings

security_scheme = HTTPBearer(auto_error=False)

# Initialize JWKS client if Clerk publishable key is configured
jwks_client: Optional[PyJWKClient] = None
clerk_domain: Optional[str] = None

if settings.CLERK_PUBLISHABLE_KEY:
    try:
        parts = settings.CLERK_PUBLISHABLE_KEY.split("_")
        if len(parts) >= 3:
            raw_b64 = parts[2]
            clerk_domain = base64.b64decode(raw_b64 + "==").decode("utf-8").rstrip("$")
            jwks_url = f"https://{clerk_domain}/.well-known/jwks.json"
            jwks_client = PyJWKClient(jwks_url)
    except Exception as e:
        print(f"Warning: Could not initialize Clerk JWKS client: {e}")

def verify_clerk_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)) -> Dict[str, Any]:
    """
    Verifies Clerk JWT token using Clerk's official JWKS endpoint or PEM key.
    Extracts the authenticated user_id to scope all database and data operations.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # 1. Official verification with PyJWKClient
    if jwks_client:
        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
            return {
                "user_id": payload.get("sub"),
                "email": payload.get("email") or payload.get("sub"),
                "claims": payload
            }
        except Exception as e:
            # If verification fails, fallback to local dev check if enabled
            if settings.ENVIRONMENT != "development":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid Clerk token signature: {str(e)}",
                    headers={"WWW-Authenticate": "Bearer"},
                )

    # 2. Local dev fallback for testing
    if settings.ENVIRONMENT == "development":
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            return {
                "user_id": unverified.get("sub", "dev_user_001"),
                "email": unverified.get("email", "dev@weathergpt.local"),
                "claims": unverified
            }
        except Exception:
            return {
                "user_id": "dev_user_001",
                "email": "dev@weathergpt.local",
                "claims": {"role": "developer"}
            }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Clerk authentication verification failed",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)) -> Optional[Dict[str, Any]]:
    """
    Returns verified Clerk user payload if a valid Bearer token is provided,
    or None if the request is anonymous / unauthenticated.
    Allows open public endpoints to provide personalized features when logged in
    without failing or blocking guest users.
    """
    if not credentials:
        return None
    try:
        return verify_clerk_token(credentials)
    except HTTPException:
        return None
