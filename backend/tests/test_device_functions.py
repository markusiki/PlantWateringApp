from datetime import datetime
from .test_helpers.db import (
    get_all_units,
    save_to_units_db,
    get_device_settings,
    save_to_device_db,
)
from time import sleep
from threading import Thread
from gpiozero.pins.mock import *


Device.pin_factory = MockFactory(pin_class=MockPWMPin)


def simulate_flow_sensor(app, get_flow_meter, get_pump, units, flow_rate, stop_after=0):
    device_settings = get_device_settings(app)
    water_amount = device_settings["waterAmount"]
    flow_meter = get_flow_meter
    pulses_per_litre = 450
    total_pulses = pulses_per_litre * units[0]["waterAmount"]
    pump = get_pump
    watering_time = units[0]["waterAmount"] / flow_rate
    pulse_interval = 1 / (total_pulses / watering_time)
    start = datetime.now()

    while True:
        if stop_after > 0 and (datetime.now() - start).total_seconds() > stop_after:
            break
        if pump.power.value:
            flow_meter.pin.pin.drive_high()
            flow_meter.pin.pin.drive_low()
            water_amount = water_amount - (1 / pulses_per_litre)
            sleep(pulse_interval / 2)
            if water_amount <= 0 or not pump.power.value:
                break


def test_water_now_waters_unit_with_time_mode(app, water_now):
    device_settings = get_device_settings(app)
    device_settings["waterAmount"] = 10
    device_settings["tankVolume"] = 10
    save_to_device_db(app, device_settings)
    units = get_all_units(app)
    units[0]["wateringMode"] = "time"
    units[0]["waterTime"] = 1
    save_to_units_db(app, units)
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
    save_to_units_db(app, units)
    update_object(units[0]["id"], 0)

    flow_rate = 0.01

    flow_sensor_simulation_thread = Thread(
        target=simulate_flow_sensor,
        daemon=True,
        args=(app, get_flow_meter, get_pump, units, flow_rate),
    )
    flow_sensor_simulation_thread.start()
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
    save_to_units_db(app, units)
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
    save_to_units_db(app, units)

    update_object(units[0]["id"], 0)

    flow_rate = 0.01

    flow_sensor_simulation_thread = Thread(
        target=simulate_flow_sensor,
        daemon=True,
        args=(app, get_flow_meter, get_pump, units, flow_rate, 2),
    )
    flow_sensor_simulation_thread.start()
    flow_meter = get_flow_meter

    status = water_now(units[0]["id"])

    assert status["isWatered"]
    assert status["message"] == "Run out of water while watering."
    assert flow_meter.getData()["lastFlowRate"] == 0
