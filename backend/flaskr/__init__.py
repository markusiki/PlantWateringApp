from datetime import timedelta
from flask import Flask
from dotenv import load_dotenv
import os


load_dotenv()


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_COOKIE_CSRF_PROTECT"] = True
    app.config["JWT_CSRF_METHODS"] = ["POST", "PUT", "PATCH", "DELETE", "GET"]
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)

    from .controllers.login import loginRouter
    from .controllers.logout import logoutRouter
    from .controllers.device import deviceRouter
    from .controllers.units import unitsRouter

    app.register_blueprint(loginRouter, url_prefix="/api/login")
    app.register_blueprint(logoutRouter, url_prefix="/api/logout")
    app.register_blueprint(deviceRouter, url_prefix="/api/device")
    app.register_blueprint(unitsRouter, url_prefix="/api/units")

    return app


""" @app.route("/")
def index():
    return app.send_static_file("index.html") """
