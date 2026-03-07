import pytest
import os
import copy

from tests.test_helpers.db import get_device_settings, get_all_units
from plant_api.databases.models.device import device_model
from plant_api.databases.models.units import units_model

path_to_test_units_DB = os.path.join(os.path.dirname(__file__), "databases/db_test.unitsDB.json")
path_to_test_device_DB = os.path.join(
    os.path.dirname(__file__), "databases/db_test.deviceSettings.json"
)


def get_models():
    copy_of_device_model = copy.deepcopy(device_model)
    copy_of_units_model = copy.deepcopy(units_model)
    del copy_of_device_model["flowSensorPulsesPerLiter"]
    for unit in copy_of_units_model:
        del unit["wateringMode"]

    return {"device_model": copy_of_device_model, "units_model": copy_of_units_model}


@pytest.mark.parametrize(
    "app",
    [
        {
            "units_db": path_to_test_units_DB,
            "device_db": path_to_test_device_DB,
            **get_models(),
        }
    ],
    indirect=True,
)
def test_models_are_updated(app):
    device_settings = get_device_settings(app)
    all_units = get_all_units(app)
    assert "flowSensorPulsesPerLiter" in device_settings.keys()
    for unit in all_units:
        assert "wateringMode" in unit.keys()
