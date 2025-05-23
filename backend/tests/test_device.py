import pytest
from .conftest import path_to_deviceDB
from .test_helpers.db import get_device_settings

base_url = "/api/device"


@pytest.fixture(autouse=True)
def login(auth):
    response = auth.login()


def test_get_all_device(app, client, auth):
    device_settings = get_device_settings(app)
    response = client.get(base_url, headers=auth.get_headers())
    device_settings = response.get_json()
    assert device_settings["runTimeProgram"] == device_settings["runTimeProgram"]
    assert device_settings["moistMeasureInterval"] == device_settings["moistMeasureInterval"]


def test_change_device_settings(client, auth):
    changed_device = {"runTimeProgram": False, "moistMeasureInterval": 1, "numberOfUnits": 2, "tankVolume": 10, "waterAmount": 50}
    response = client.put(base_url, json=changed_device, headers=auth.get_headers())
    returned_settings = response.get_json()
    assert returned_settings["runTimeProgram"] == changed_device["runTimeProgram"]
    assert returned_settings["moistMeasureInterval"] == changed_device["moistMeasureInterval"]
    assert returned_settings["numberOfUnits"] == changed_device["numberOfUnits"]
    assert returned_settings["waterAmount"] == changed_device["waterAmount"]
