import json


def convert_moist_value(app, unit, value):
    with app.app_context():
        from plant_api.services.unitsDB import convertMoistValue

        converted_value = convertMoistValue(unit, value)
        return converted_value


def get_all_units(app):
    with app.app_context():
        from plant_api.services.unitsDB import getUnits

        units = getUnits()
        return units


def save_to_units_db(app, units):
    with app.app_context():
        from plant_api.services.unitsDB import saveToDb

        saveToDb(units)


def save_log_to_units_db(app, unitLog):
    with app.app_context():
        from plant_api.services.unitsDB import updateLog

        updateLog(**unitLog)


def get_device_settings(app):
    with app.app_context():
        from plant_api.services.deviceSettings import getAll

        settings = getAll()
        return settings


def save_to_device_db(app, settings):
    with app.app_context():
        from plant_api.services.deviceSettings import saveToDb

        saveToDb(settings)
