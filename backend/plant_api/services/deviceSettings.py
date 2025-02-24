from flask import current_app
from .dbHelper import openDB, dumpDB

path = ""


def setDeviceDB(app):
    global path
    with app.app_context():
        path = current_app.config["DEVICE_DB"]

def getAll():
    settings = openDB(path)
    return settings

def saveToDb(settings):
    dumpDB(path, settings)

def changeSettings(body):
    settings = getAll()
    settings["runTimeProgram"] = body["runTimeProgram"]
    settings["moistMeasureInterval"] = body["moistMeasureInterval"]
    settings["numberOfUnits"] = body["numberOfUnits"]
    saveToDb(settings)
    changedSettings = getAll()
    return changedSettings

def getNumberOfUnits():
    deviceSettings = getAll()
    numberOfUnits = deviceSettings["numberOfUnits"]
    return numberOfUnits
