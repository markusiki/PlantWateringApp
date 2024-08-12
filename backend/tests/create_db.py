import json
from .units import units
from .users import users
from .device import device


def create_test_units_db(path):
    file = open(path, "w")
    json.dump(units, file)
    file.close()


def create_test_users_db(path):
    file = open(path, "w")
    json.dump(users, file)
    file.close()


def create_test_device_db(path):
    file = open(path, "w")
    json.dump(device, file)
    file.close()
