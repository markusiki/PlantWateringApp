import os
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
db = "../deviceSettings.json"
path = os.path.join(base_dir, db)



def getAll():
    file = open(path)
    settings = json.load(file)
    file.close()
    return settings


def changeSettings(body):
    settings = getAll()
    settings["autoWatering"] = body["autoWatering"]
    settings["moistMeasureInterval"] = body["moistMeasureInterval"]
    file = open(path, "w")
    json.dump(settings, file)
    file.close()
    changedSettings = getAll()
    return changedSettings
