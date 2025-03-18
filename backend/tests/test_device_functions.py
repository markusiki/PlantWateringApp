import pytest
from .conftest import path_to_unitsDB, path_to_deviceDB
from .test_helpers.db import (
    get_all_units,
    save_to_units_db,
    get_device_settings,
    save_to_device_db,
    save_log_to_units_db,
)
from time import sleep
from .test_helpers.create_db import create_test_units_db, create_test_device_db
from datetime import datetime


@pytest.fixture(autouse=True)
def run_around_tests(app):
    # Before each test
    create_test_units_db(path_to_unitsDB)
    create_test_device_db(path_to_deviceDB)

def test_water_now_waters_unit(app, water_now):
    units = get_all_units(app)
    status = water_now(units[0]["id"])
    assert status["isWatered"]
    assert status["message"] == ""

def test_water_now_does_not_water_if_no_water_left(app, update_object, water_now):
    settings = get_device_settings(app)
    settings["waterAmount"] = 0.5
    save_to_device_db(app, settings)
    units = get_all_units(app)
    units[0]["waterFlowRate"] = 1
    save_to_units_db(app, units)
    update_object(units[0]["id"], 0)

    status = water_now(units[0]["id"])
    
    assert status["isWatered"] == False
    assert status["message"] == "Not enough water" 
