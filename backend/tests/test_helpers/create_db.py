import json
from plant_api.databases.models.units import units_model
from .users import users
from plant_api.databases.models.device import device_model


def create_test_units_db(path):
    file = open(path, "w")
    json.dump(units_model, file)
    file.close()


def create_test_users_db(path):
    file = open(path, "w")
    json.dump(users, file)
    file.close()


def create_test_device_db(path):
    file = open(path, "w")
    json.dump(device_model, file)
    file.close()
