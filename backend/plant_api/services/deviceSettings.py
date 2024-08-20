from flask import current_app
import json

# base_dir = os.path.dirname(os.path.abspath(__file__))
# db = "../deviceSettings.json"
# path = os.path.join(base_dir, db)

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
    settings["autoWatering"] = body["autoWatering"]
    settings["moistMeasureInterval"] = body["moistMeasureInterval"]
    saveToDb(settings)
    changedSettings = getAll()
    return changedSettings
