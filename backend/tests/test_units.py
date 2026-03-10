import pytest
import asyncio
from datetime import datetime
from .test_helpers import (
    get_all_units,
    save_units,
    get_device_settings,
    save_to_device_db,
    flow_sensor_simulation,
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

    save_units(app, units)

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


def test_get_moist_values(app, client, auth):
    response = client.get(f"{base_url}/moistValues", headers=auth.get_headers())
    assert response.status_code == 200
    response_data = response.get_json()
    assert len(response_data) is 4
    for unit in response_data:
        assert unit["id"]
        assert unit["moistValue"] >= 0


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


def test_cancel_watering(app, client, auth):
    units = get_all_units(app)
    units[0]["name"] = "Test_unit1"
    units[1]["name"] = "Test_unit2"
    units[1]["waterTime"] = 5
    units[1]["waterFlowRate"] = 0.2

    save_units(app, units)

    async def water():
        start = datetime.now()
        response = await asyncio.to_thread(
            client.post, f"{base_url}/Unit2", headers=auth.get_headers()
        )
        end = datetime.now()
        response_data = response.get_json()
        waterAmount = response_data["unit"]["logs"][0]["waterAmount"]
        assert (end - start).total_seconds() < units[1]["waterTime"]
        assert response.status_code == 200
        assert response_data["unit"]["logs"][0]["message"] == "Watering cancelled by user."
        assert response_data["unit"]["logs"][0]["watered"] is True
        assert waterAmount > 0 and waterAmount < units[1]["waterFlowRate"] * units[1]["waterTime"]
        assert (
            response_data["unit"]["totalWateredAmount"]
            < units[1]["waterFlowRate"] * units[1]["waterTime"]
        )

    async def try_cancel_wrong_unit():
        # Wait a bit to ensure watering has started
        await asyncio.sleep(1)
        response = await asyncio.to_thread(
            client.post, f"{base_url}/cancelWatering/Unit1", headers=auth.get_headers()
        )
        assert response.status_code == 200
        response_data = response.get_json()
        assert (
            f"No manual watering process in progress for {units[0]['name']}."
            in response_data["message"]
        )

    async def cancel_watering():
        # Wait a bit to ensure watering has started
        await asyncio.sleep(2)
        response = await asyncio.to_thread(
            client.post, f"{base_url}/cancelWatering/Unit2", headers=auth.get_headers()
        )
        assert response.status_code == 200
        response_data = response.get_json()
        assert f"Watering cancelled for {units[1]['name']}." in response_data["message"]

    async def run_test():
        await asyncio.gather(
            water(),
            try_cancel_wrong_unit(),
            cancel_watering(),
        )

    asyncio.run(run_test())


def test_cancel_watering_using_amount(app, client, auth, get_flow_meter, get_pump):
    device = get_device_settings(app)
    device["useFlowSensor"] = True
    save_to_device_db(app, device)

    units = get_all_units(app)
    units[0]["name"] = "Test_unit1"
    units[1]["name"] = "Test_unit2"
    units[1]["waterTime"] = 5
    units[1]["waterFlowRate"] = 0.2
    units[1]["wateringMode"] = "amount"
    units[1]["waterAmount"] = 1

    save_units(app, units)
    flow_sensor_simulation(
        app=app,
        get_flow_meter=get_flow_meter,
        get_pump=get_pump,
        unit=units[1],
        flow_rate=units[1]["waterFlowRate"],
    ).start()

    async def water():
        start = datetime.now()
        response = await asyncio.to_thread(
            client.post, f"{base_url}/Unit2", headers=auth.get_headers()
        )
        end = datetime.now()
        response_data = response.get_json()
        waterAmount = response_data["unit"]["logs"][0]["waterAmount"]
        assert (end - start).total_seconds() < units[1]["waterTime"]
        assert response.status_code == 200
        assert response_data["unit"]["logs"][0]["message"] == "Watering cancelled by user."
        assert response_data["unit"]["logs"][0]["watered"] is True
        assert waterAmount > 0 and waterAmount < units[1]["waterAmount"]

    async def try_cancel_wrong_unit():
        # Wait a bit to ensure watering has started
        await asyncio.sleep(1)
        response = await asyncio.to_thread(
            client.post, f"{base_url}/cancelWatering/Unit1", headers=auth.get_headers()
        )
        assert response.status_code == 200
        response_data = response.get_json()
        assert (
            f"No manual watering process in progress for {units[0]['name']}."
            in response_data["message"]
        )

    async def cancel_watering():
        # Wait a bit to ensure watering has started
        await asyncio.sleep(2)
        response = await asyncio.to_thread(
            client.post, f"{base_url}/cancelWatering/Unit2", headers=auth.get_headers()
        )
        assert response.status_code == 200
        response_data = response.get_json()
        assert f"Watering cancelled for {units[1]['name']}." in response_data["message"]

    async def run_test():
        await asyncio.gather(
            water(),
            try_cancel_wrong_unit(),
            cancel_watering(),
        )

    asyncio.run(run_test())


def test_delete_unit_logs(app, client, auth):
    response = client.post(f"{base_url}/Unit1", headers=auth.get_headers())
    units_in_db = get_all_units(app)
    assert len(units_in_db[0]["logs"]) == 1
    response = client.delete(f"{base_url}/logs/Unit1", headers=auth.get_headers())
    response_data = response.get_json()
    assert response_data["logs"] == []
