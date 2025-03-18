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
    if body["tankVolume"]:
        settings["tankVolume"] = body["tankVolume"]
    if body["waterAmount"]:
        settings["waterAmount"] = body["waterAmount"]
    saveToDb(settings)
    changedSettings = getAll()
    return changedSettings

def getData(data):
    deviceSettings = getAll()
    data = deviceSettings[data]
    return data

def updateWaterAmount(wateringAmount: float):
    settings = getAll()
    settings["waterAmount"] = round(settings["waterAmount"] - wateringAmount, 3)
    saveToDb(settings)

