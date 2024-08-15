from datetime import timedelta
from flask import Flask
from dotenv import load_dotenv
import os
from .services.users import setUsersDB
from .services.db import setUnitsDB
from .services.deviceSettings import setDeviceDB


load_dotenv()


def create_app(test_config=None):

    app = Flask(__name__, instance_relative_config=True)
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_COOKIE_CSRF_PROTECT"] = True
    app.config["JWT_CSRF_METHODS"] = ["POST", "PUT", "PATCH", "DELETE", "GET"]
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
    app.config["TESTING"] = False if test_config is None else test_config["TESTING"]
    app.config["USERS_DB"] = (
        os.path.join(os.path.dirname(__file__), "../databases/users.json")
        if test_config is None
        else test_config["USERS_DB"]
    )
    app.config["UNITS_DB"] = (
        os.path.join(os.path.dirname(__file__), "../databases/unitsDB.json")
        if test_config is None
        else test_config["UNITS_DB"]
    )
    app.config["DEVICE_DB"] = (
        os.path.join(os.path.dirname(__file__), "../databases/deviceSettings.json")
        if test_config is None
        else test_config["DEVICE_DB"]
    )

    setUsersDB(app)
    setUnitsDB(app)
    setDeviceDB(app)

    from .controllers.login import loginRouter
    from .controllers.logout import logoutRouter
    from .controllers.device import deviceRouter
    from .controllers.units import unitsRouter

    app.register_blueprint(loginRouter, url_prefix="/api/login")
    app.register_blueprint(logoutRouter, url_prefix="/api/logout")
    app.register_blueprint(deviceRouter, url_prefix="/api/device")
    app.register_blueprint(unitsRouter, url_prefix="/api/units")

    return app
