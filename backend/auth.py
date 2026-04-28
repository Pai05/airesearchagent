import base64
import json
import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}

def _load_firebase_credentials():
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if cred_path and os.path.exists(cred_path):
        return credentials.Certificate(cred_path)

    raw_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if raw_json:
        try:
            return credentials.Certificate(json.loads(raw_json))
        except Exception as exc:
            print(f"WARNING: FIREBASE_SERVICE_ACCOUNT_JSON could not be parsed: {exc}")

    raw_b64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_B64")
    if raw_b64:
        try:
            decoded = base64.b64decode(raw_b64).decode("utf-8")
            return credentials.Certificate(json.loads(decoded))
        except Exception as exc:
            print(f"WARNING: FIREBASE_SERVICE_ACCOUNT_B64 could not be decoded: {exc}")

    return None


firebase_ready = False
firebase_credentials = _load_firebase_credentials()
if firebase_credentials is not None:
    firebase_admin.initialize_app(firebase_credentials)
    firebase_ready = True
else:
    print(
        "WARNING: Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH, "
        "FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_SERVICE_ACCOUNT_B64. Auth verification will fail."
    )

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
