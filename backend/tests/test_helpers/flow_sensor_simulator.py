from datetime import datetime

from threading import Thread
from time import sleep

from tests.test_helpers.db import get_device_settings


def simulate_flow_sensor(app, get_flow_meter, get_pump, unit, flow_rate, stop_after):
    device_settings = get_device_settings(app)
    water_amount = device_settings["waterAmount"]
    flow_meter = get_flow_meter
    pulses_per_litre = 450
    total_pulses = pulses_per_litre * unit["waterAmount"]
    pump = get_pump
    watering_time = unit["waterAmount"] / flow_rate
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


def flow_sensor_simulation(app, get_flow_meter, get_pump, unit, flow_rate=0.01, stop_after=0):
    flow_sensor_simulation = Thread(
        target=simulate_flow_sensor,
        daemon=True,
        args=(app, get_flow_meter, get_pump, unit, flow_rate, stop_after),
    )

    return flow_sensor_simulation
