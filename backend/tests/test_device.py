import pytest
from .conftest import path_to_deviceDB
from .test_helpers.db import get_from_db

base_url = "/api/device"


@pytest.fixture(autouse=True)
def login(auth):
    response = auth.login()
    print(response)


def test_get_all_device(client, auth):
    device_settings = get_from_db(path_to_deviceDB)
    response = client.get(base_url, headers=auth.get_headers())
    device_settings = response.get_json()
    assert device_settings["autoWatering"] == device_settings["autoWatering"]
    assert device_settings["moistMeasureInterval"] == device_settings["moistMeasureInterval"]


def test_change_device_settings(client, auth):
    changed_device = {"autoWatering": False, "moistMeasureInterval": 1}
    response = client.put(base_url, json=changed_device, headers=auth.get_headers())
    returned_settings = response.get_json()
    assert returned_settings["autoWatering"] == changed_device["autoWatering"]
    assert returned_settings["moistMeasureInterval"] == changed_device["moistMeasureInterval"]
