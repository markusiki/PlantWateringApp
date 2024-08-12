import os
from flask_jwt_extended import JWTManager
import pytest
from plant_api import create_app
from .create_db import create_test_units_db, create_test_users_db, create_test_device_db

unitsDB = "unitsDB.test.json"
path_to_unitsDB = os.path.join(os.path.dirname(__file__), "databases/unitsDB.test.json")
usersDB = "users.test.json"
path_to_usersDB = os.path.join(os.path.dirname(__file__), "databases/users.test.json")
deviceDB = "deviceSettings.test.json"
path_to_deviceDB = os.path.join(os.path.dirname(__file__), "databases/deviceSettings.test.json")


@pytest.fixture
def app():
    create_test_users_db(path_to_usersDB)
    create_test_units_db(path_to_unitsDB)
    create_test_device_db(path_to_deviceDB)
    app = create_app(
        {
            "TESTING": True,
            "UNITS_DB": path_to_unitsDB,
            "USERS_DB": path_to_usersDB,
            "DEVICE_DB": path_to_deviceDB,
        }
    )

    JWTManager(app)

    yield app

    # clean up / reset resources here


@pytest.fixture
def client(app):
    return app.test_client()
