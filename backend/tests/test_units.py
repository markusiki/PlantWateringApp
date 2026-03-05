import pytest

from tests.conftest import auth
from .test_helpers.db import (
    get_all_units,
    convert_moist_value,
    save_to_units_db,
    get_device_settings,
    save_to_device_db,
)

base_url = "/api/units"


@pytest.fixture(autouse=True)
def login(auth):
    auth.login()


@pytest.fixture(autouse=True, scope="function")
def before_tests(app):
    device_settings = get_device_settings(app)
    device_settings["tankVolume"] = 100
    device_settings["waterAmount"] = 100
    save_to_device_db(app, device_settings)


def test_get_all_units(app, client, auth):
    units = get_all_units(app)
    for unit in units:
        if unit["id"] == "Unit1" or unit["id"] == "Unit2":
            unit["dryMoistValue"] = 21000
            unit["wetMoistValue"] = 8000
        else:
            unit["dryMoistValue"] = 15000
            unit["wetMoistValue"] = 30000

    save_to_units_db(app, units)

    response = client.get(base_url, headers=auth.get_headers())
    assert response.status_code == 200
    response_data = response.get_json()
    assert len(response_data) is 4
    for unit in response_data:
        assert unit["id"]
        assert unit["name"]
        assert unit["status"]
        assert unit["moistValue"] >= 0
        assert unit["moistLimit"]
        assert unit["waterTime"]
        assert unit["enableAutoWatering"] == False
        assert unit["enableMaxWaterInterval"] == False
        assert unit["enableMinWaterInterval"] == False
        assert unit["maxWaterInterval"]
        assert unit["minWaterInterval"]
        assert not unit.get("sensor", False)
        assert not unit.get("valve", False)


def test_change_unit_settings(client, auth, app):
    modified_unit = {
        "id": "Unit2",
        "name": "Test_unit2",
        "moistLimit": 50,
        "waterTime": 10,
        "waterAmount": 2,
        "enableAutoWatering": True,
        "enableMaxWaterInterval": True,
        "enableMinWaterInterval": True,
        "maxWaterInterval": 9,
        "minWaterInterval": 10,
        "waterFlowRate": 0.2,
        "wateringMode": "time",
    }

    response = client.put(base_url, json=modified_unit, headers=auth.get_headers())
    returned_unit = response.get_json()
    assert returned_unit["id"] == modified_unit["id"]
    assert returned_unit["name"] == modified_unit["name"]
    assert returned_unit["moistLimit"] == modified_unit["moistLimit"]
    assert returned_unit["waterTime"] == modified_unit["waterTime"]
    assert returned_unit["waterAmount"] == modified_unit["waterAmount"]
    assert returned_unit["enableAutoWatering"] == modified_unit["enableAutoWatering"]
    assert returned_unit["enableMaxWaterInterval"] == modified_unit["enableMaxWaterInterval"]
    assert returned_unit["enableMinWaterInterval"] == modified_unit["enableMinWaterInterval"]
    assert returned_unit["maxWaterInterval"] == modified_unit["maxWaterInterval"]
    assert returned_unit["minWaterInterval"] == modified_unit["minWaterInterval"]
    assert returned_unit["waterFlowRate"] == modified_unit["waterFlowRate"]
    assert returned_unit["wateringMode"] == modified_unit["wateringMode"]
    assert returned_unit["status"]
    assert returned_unit["moistValue"]
    assert returned_unit["logs"] == []
    assert not returned_unit.get("sensor", False)
    assert not returned_unit.get("valve", False)

    with app.app_context():
        from plant_api.deviceFunctions import getObjects

        unit_objects = getObjects()

    for unit in unit_objects:
        if unit.id == modified_unit["id"]:
            assert unit.waterTime == modified_unit["waterTime"]


def test_water_unit(app, client, auth):
    units_in_db = get_all_units(app)
    assert units_in_db[0]["logs"] == []
    response = client.post(f"{base_url}/Unit1", headers=auth.get_headers())
    response_data = response.get_json()
    unit = response_data["unit"]
    assert len(unit["logs"]) == 1
    assert unit["logs"][0]["watered"] is True
    assert (
        unit["totalWateredAmount"]
        == units_in_db[0]["totalWateredAmount"]
        + units_in_db[0]["waterFlowRate"] * units_in_db[0]["waterTime"]
    )


def test_delete_unit_logs(app, client, auth):
    response = client.post(f"{base_url}/Unit1", headers=auth.get_headers())
    units_in_db = get_all_units(app)
    assert len(units_in_db[0]["logs"]) == 1
    response = client.delete(f"{base_url}/logs/Unit1", headers=auth.get_headers())
    response_data = response.get_json()
    assert response_data["logs"] == []
