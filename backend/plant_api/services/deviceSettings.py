from flask import current_app
import json

path = ""


def setDeviceDB(app):
    global path
    with app.app_context():
        path = current_app.config["DEVICE_DB"]


def getAll():
    file = open(path)
    settings = json.load(file)
    file.close()
    return settings


def saveToDb(settings):
    file = open(path, "w")
    json.dump(settings, file)
    file.close()


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
