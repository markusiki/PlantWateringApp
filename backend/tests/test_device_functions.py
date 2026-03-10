from .test_helpers import (
    get_all_units,
    save_units,
    get_device_settings,
    save_to_device_db,
    flow_sensor_simulation,
)
from gpiozero.pins.mock import *


Device.pin_factory = MockFactory(pin_class=MockPWMPin)


def test_water_now_waters_unit_with_time_mode(app, water_now):
    device_settings = get_device_settings(app)
    device_settings["waterAmount"] = 10
    device_settings["tankVolume"] = 10
    save_to_device_db(app, device_settings)
    units = get_all_units(app)
    units[0]["wateringMode"] = "time"
    units[0]["waterTime"] = 1
    save_units(app, units)
    status = water_now(units[0]["id"])
    assert status["isWatered"]
    assert status["message"] == ""


def test_water_now_waters_unit_with_amount_mode(
    app, update_object, water_now, get_flow_meter, get_pump
):
    device_settings = get_device_settings(app)
    device_settings["waterAmount"] = 10
    device_settings["tankVolume"] = 10
    device_settings["useFlowSensor"] = True
    save_to_device_db(app, device_settings)
    units = get_all_units(app)
    units[0]["wateringMode"] = "amount"
    units[0]["waterAmount"] = 0.05
    save_units(app, units)
    update_object(units[0]["id"], 0)

    flow_sensor_simulation(
        app=app, get_flow_meter=get_flow_meter, get_pump=get_pump, unit=units[0]
    ).start()
    status = water_now(units[0]["id"])

    assert status["isWatered"]
    assert status["message"] == ""
    assert status["wateredAmount"] == units[0]["waterAmount"]
    assert status["flowRate"]


def test_water_now_does_not_water_if_no_water_left_with_time_mode(app, update_object, water_now):
    device_settings = get_device_settings(app)
    device_settings["tankVolume"] = 10
    device_settings["waterAmount"] = 0.5
    save_to_device_db(app, device_settings)
    units = get_all_units(app)
    units[0]["waterFlowRate"] = 1
    save_units(app, units)
    update_object(units[0]["id"], 0)

    status = water_now(units[0]["id"])

    assert status["isWatered"] == False
    assert status["message"] == "Not enough water"


def test_water_now_stops_watering_if_no_water_left_with_amount_mode(
    app, update_object, water_now, get_flow_meter, get_pump
):
    device_settings = get_device_settings(app)
    device_settings["tankVolume"] = 10
    device_settings["waterAmount"] = 2
    device_settings["useFlowSensor"] = True
    save_to_device_db(app, device_settings)
    units = get_all_units(app)
    units[0]["wateringMode"] = "amount"
    units[0]["waterAmount"] = 1
    save_units(app, units)

    update_object(units[0]["id"], 0)

    flow_sensor_simulation(
        app=app, get_flow_meter=get_flow_meter, get_pump=get_pump, unit=units[0], stop_after=2
    ).start()
    flow_meter = get_flow_meter

    status = water_now(units[0]["id"])

    assert status["isWatered"]
    assert status["message"] == "Run out of water while watering."
    assert flow_meter.getData()["lastFlowRate"] == 0
