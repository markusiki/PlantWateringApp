import json


def get_all_units(app):
    with app.app_context():
        from plant_api.services.db import getUnits

        units = getUnits()
        return units


def save_to_units_db(app, units):
    with app.app_context():
        from plant_api.services.db import saveToDb

        saveToDb(units)


def get_device_settings(app):
    with app.app_context():
        from plant_api.services.deviceSettings import getAll

        settings = getAll()
        return settings


def save_to_device_db(app, settings):
    with app.app_context():
        from plant_api.services.deviceSettings import saveToDb

        saveToDb(settings)
