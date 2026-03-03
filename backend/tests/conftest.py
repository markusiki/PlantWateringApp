import os
from flask_jwt_extended import JWTManager
import pytest
from flask import jsonify
from plant_api import create_app
from .test_helpers.create_db import (
    create_test_units_db,
    create_test_users_db,
    create_test_device_db,
)
from gpiozero import Device
from gpiozero.pins.mock import MockFactory, MockPWMPin

Device.pin_factory = MockFactory(pin_class=MockPWMPin)


db_dir = os.path.join(os.path.dirname(__file__), "databases")

if not os.path.isdir(db_dir):
    os.makedirs(db_dir)

path_to_unitsDB = os.path.join(os.path.dirname(__file__), "databases/unitsDB.test.json")
path_to_usersDB = os.path.join(os.path.dirname(__file__), "databases/users.test.json")
path_to_deviceDB = os.path.join(os.path.dirname(__file__), "databases/deviceSettings.test.json")


@pytest.fixture(scope="module", autouse=True)
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


@pytest.fixture()
def no_default_factory(request):
    save_pin_factory = Device.pin_factory
    Device.pin_factory = None
    try:
        yield None
    finally:
        Device.pin_factory = save_pin_factory


@pytest.fixture(scope="function")
def mock_factory(request):
    save_factory = Device.pin_factory
    Device.pin_factory = MockFactory()
    try:
        yield Device.pin_factory
        # This reset() may seem redundant given we're re-constructing the
        # factory for each function that requires it but MockFactory (via
        # LocalFactory) stores some info at the class level which reset()
        # clears.
    finally:
        if Device.pin_factory is not None:
            Device.pin_factory.reset()
        Device.pin_factory = save_factory


@pytest.fixture()
def pwm(request, mock_factory):
    mock_factory.pin_class = MockPWMPin


@pytest.fixture(scope="module")
def client(app):
    return app.test_client()


class AuthActions(object):
    def __init__(self, client):
        self._client = client

    def login(self, username="test", password="test"):
        return self._client.post("/api/login", json={"username": username, "password": password})

    def logout(self):
        return self._client.post("/api/logout")

    def get_headers(self):
        return {"X-CSRF-TOKEN": self._client.get_cookie(key="csrf_access_token").value}


@pytest.fixture(scope="module")
def auth(client):
    return AuthActions(client)


@pytest.fixture()
def set_time_program(app):
    with app.app_context():
        from plant_api.timeProgram import setTimeProgram

        return setTimeProgram


@pytest.fixture()
def water_now(app):
    with app.app_context():
        from plant_api.deviceFunctions import waterNow

        return waterNow


@pytest.fixture()
def update_object(app):
    with app.app_context():
        from plant_api.deviceFunctions import updateSprinklerUnitObject

        return updateSprinklerUnitObject


@pytest.fixture()
def get_flow_meter(app):
    with app.app_context():
        from plant_api.deviceFunctions import flowMeter

        return flowMeter


@pytest.fixture()
def get_pump(app):
    with app.app_context():
        from plant_api.deviceFunctions import pump

        return pump
