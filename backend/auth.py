import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.config import load_dotenv


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}

# Initialize Firebase Admin
cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
firebase_ready = False
if cred_path and os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    firebase_ready = True
else:
    print(f"WARNING: Firebase service account not found at {cred_path}. Auth verification will fail.")

ALLOW_DEV_AUTH_BYPASS = _env_bool("ALLOW_DEV_AUTH_BYPASS", default=False)

security = HTTPBearer(auto_error=False)

async def get_current_user(authorization: HTTPAuthorizationCredentials = Security(security)):
    """Verifies Firebase ID token; optionally allows local dev bypass."""
    if ALLOW_DEV_AUTH_BYPASS and authorization is None:
        return {"uid": "dev-user", "dev_bypass": True}

    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.credentials

    if not firebase_ready and not ALLOW_DEV_AUTH_BYPASS:
        raise HTTPException(
            status_code=500,
            detail="Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH to a valid service account JSON.",
        )

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        if ALLOW_DEV_AUTH_BYPASS:
            return {"uid": "dev-user", "dev_bypass": True, "auth_error": str(e)}
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
