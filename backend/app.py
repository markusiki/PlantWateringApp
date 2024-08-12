from plant_api import create_app
from datetime import timedelta, timezone, datetime
from flask import jsonify
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies,
)


app = create_app()
jwt = JWTManager(app)


@jwt.expired_token_loader
def expired_token_callback(header, data):
    response = jsonify({"status": 401, "message": "logout successful"})
    unset_jwt_cookies(response)
    return response, 401


@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response
