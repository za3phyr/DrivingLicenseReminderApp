from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from firebase_admin.auth import (
    InvalidIdTokenError,
    ExpiredIdTokenError,
    RevokedIdTokenError,
)

security = HTTPBearer()

# ─── Verify Token ───
# The frontend authenticates with the Firebase client SDK and sends the
# resulting Firebase ID token (see AuthContext.js -> firebaseUser.getIdToken()).
# So verification here must check that token with the Firebase Admin SDK,
# not decode a custom app-issued JWT.
def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(token)
        if decoded.get("uid") is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return decoded
    except (InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")