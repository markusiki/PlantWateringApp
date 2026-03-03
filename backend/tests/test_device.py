import pytest
from .conftest import path_to_unitsDB, path_to_deviceDB
from tests.test_helpers.create_db import create_test_device_db, create_test_units_db
from .conftest import path_to_deviceDB
from .test_helpers.db import get_device_settings

base_url = "/api/device"


@pytest.fixture(autouse=True)
def login(auth):
    response = auth.login()


@pytest.fixture(autouse=True)
def run_around_tests(app):
    # Before each test
    create_test_units_db(path_to_unitsDB)
    create_test_device_db(path_to_deviceDB)


def test_get_all_device(app, client, auth):
    device_settings = get_device_settings(app)
    response = client.get(base_url, headers=auth.get_headers())
    device_settings = response.get_json()
    assert device_settings["runTimeProgram"] == device_settings["runTimeProgram"]
    assert device_settings["moistMeasureInterval"] == device_settings["moistMeasureInterval"]


def test_change_device_settings(client, auth):
    changed_device = {
        "runTimeProgram": False,
        "moistMeasureInterval": 1,
        "numberOfUnits": 2,
        "tankVolume": 10,
        "waterAmount": 50,
        "useFlowSensor": True,
    }
    response = client.put(base_url, json=changed_device, headers=auth.get_headers())
    returned_settings = response.get_json()
    assert returned_settings["runTimeProgram"] == changed_device["runTimeProgram"]
    assert returned_settings["moistMeasureInterval"] == changed_device["moistMeasureInterval"]
    assert returned_settings["numberOfUnits"] == changed_device["numberOfUnits"]
    assert returned_settings["waterAmount"] == changed_device["waterAmount"]
    assert returned_settings["useFlowSensor"] == changed_device["useFlowSensor"]
