from datetime import timedelta, timezone, datetime
from flask import Flask, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies,
)
from dotenv import load_dotenv
import os


load_dotenv()

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_CSRF_PROTECT"] = True
app.config["JWT_CSRF_METHODS"] = ["POST", "PUT", "PATCH", "DELETE", "GET"]
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


from controllers import device, units, login, logout

app.register_blueprint(login.loginRouter, url_prefix="/login")
app.register_blueprint(logout.logoutRouter, url_prefix="/logout")
app.register_blueprint(device.deviceRouter, url_prefix="/api/device")
app.register_blueprint(units.unitsRouter, url_prefix="/api/units")


@jwt.expired_token_loader
def expired_token_callback(header, data):
    response = jsonify({"status": 401, "msg": "logout successful"})
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


@app.route("/")
def index():
    return app.send_static_file("index.html")
