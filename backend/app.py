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
from plant_api.timeProgram import setTimeProgram

setTimeProgram()


@jwt.expired_token_loader
def expired_token_callback(header, data):
    response = jsonify({"status": 401, "message": "Session expired. Please login again!"})
    unset_jwt_cookies(response)
    return response, 401
