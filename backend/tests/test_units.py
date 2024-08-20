import pytest
from .conftest import path_to_unitsDB
from .test_helpers.db import get_from_db

base_url = "/api/units"


@pytest.fixture(autouse=True)
def login(auth):
    response = auth.login()
    print(response)


def test_get_all_units(client, auth):
    response = client.get(base_url, headers=auth.get_headers())
    assert response.status_code == 200
    response_data = response.get_json()
    assert len(response_data) is 4
    for unit in response_data:
        assert unit["id"]
        assert unit["name"]
        assert unit["status"]
        assert unit["moistValue"]
        assert unit["moistLimit"]
        assert unit["waterTime"]
        assert unit["enableMaxWaterInterval"]
        assert unit["enableMinWaterInterval"]
        assert unit["maxWaterInterval"]
        assert unit["minWaterInterval"]


def test_change_unit_settings(client, auth, app):
    modified_unit = {
        "id": "Unit1",
        "name": "Test_unit1",
        "moistLimit": 10000,
        "waterTime": 10,
        "enableMaxWaterInterval": False,
        "enableMinWaterInterval": False,
        "maxWaterInterval": 9,
        "minWaterInterval": 10,
    }

    response = client.put(base_url, json=modified_unit, headers=auth.get_headers())
    returned_unit = response.get_json()
    assert returned_unit["id"] == modified_unit["id"]
    assert returned_unit["name"] == modified_unit["name"]
    assert returned_unit["moistLimit"] == modified_unit["moistLimit"]
    assert returned_unit["waterTime"] == modified_unit["waterTime"]
    assert returned_unit["enableMaxWaterInterval"] == modified_unit["enableMaxWaterInterval"]
    assert returned_unit["enableMinWaterInterval"] == modified_unit["enableMinWaterInterval"]
    assert returned_unit["maxWaterInterval"] == modified_unit["maxWaterInterval"]
    assert returned_unit["minWaterInterval"] == modified_unit["minWaterInterval"]
    assert returned_unit["status"]
    assert returned_unit["moistValue"]
    assert returned_unit["logs"] == []
    assert returned_unit["sensor"] == "ADS.P0"
    assert returned_unit["valve"] == 27

    with app.app_context():
        from plant_api.deviceFunctions import getObjects

        unit_objects = getObjects()

    for unit in unit_objects:
        if unit.id == modified_unit["id"]:
            assert unit.moistValue == returned_unit["moistValue"]
            assert unit.moistLimit == modified_unit["moistLimit"]
            assert unit.waterTime == modified_unit["waterTime"]


def test_water_unit(client, auth):
    units_in_db = get_from_db(path_to_unitsDB)
    assert units_in_db[0]["logs"] == []
    response = client.post(f"{base_url}/Unit1", headers=auth.get_headers())
    response_data = response.get_json()
    assert len(response_data["logs"]) == 1
    assert response_data["logs"][0]["watered"] is True


def test_delete_unit_logs(client, auth):
    units_in_db = get_from_db(path_to_unitsDB)
    assert len(units_in_db[0]["logs"]) == 1
    response = client.delete(f"{base_url}/logs/Unit1", headers=auth.get_headers())
    response_data = response.get_json()
    assert response_data["logs"] == []