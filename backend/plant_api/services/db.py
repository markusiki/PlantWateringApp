from flask import current_app
import json
from datetime import datetime

path: str


def setUnitsDB(app):
    global path
    with app.app_context():
        path = current_app.config["UNITS_DB"]


# base_dir = os.path.dirname(os.path.abspath(__file__))
# db = "../unitsDB.json"
# path = os.path.join(base_dir, db)


def getUnits(innerUse=True):
    file = open(path, "r")
    units = json.load(file)
    file.close()
    if innerUse:
        return units
    else:
        for unit in units:
            unit.pop("sensor")
            unit.pop("valve")
        return units


def findById(id):
    units = getUnits()
    index = -1
    for i, unit in enumerate(units):
        if unit["id"] == id:
            index = i

    if index != -1:
        return index


def getById(id):
    units = getUnits()
    for unit in units:
        if unit["id"] == id:
            return unit


def saveToDb(units):
    file = open(path, "w")
    json.dump(units, file)
    file.close()


def modifyUnitToDB(unitToChange, index):
    units = getUnits()
    unit = units[index]
    unit["name"] = unitToChange["name"]
    unit["moistLimit"] = int(unitToChange["moistLimit"])
    unit["waterTime"] = int(unitToChange["waterTime"])
    unit["enableMaxWaterInterval"] = unitToChange["enableMaxWaterInterval"]
    unit["enableMinWaterInterval"] = unitToChange["enableMinWaterInterval"]
    unit["maxWaterInterval"] = unitToChange["maxWaterInterval"]
    unit["minWaterInterval"] = unitToChange["minWaterInterval"]
    saveToDb(units)
    changedUnits = getUnits()
    changedUnit = changedUnits[index]
    return changedUnit


def updateLog(id="", status="", moistValue=0, watered=False, waterMethod=""):
    timeStamp = datetime.now().strftime("%d.%m.%Y %H:%M")
    units = getUnits()
    index = findById(id)
    unit = units[index]
    logs = unit["logs"]
    newLog = {
        "date": timeStamp,
        "moistValue": round(moistValue / 100) * 100,
        "status": status,
        "watered": watered,
        "waterMethod": waterMethod,
    }
    logs.insert(0, newLog)
    saveToDb(units)


def deleteLog(id):
    units = getUnits()
    index = findById(id)
    unit = units[index]
    unit["logs"] = []
    saveToDb(units)


def updateMoistValuesToDB(moistValues):
    minValue: int = 8000  # totally wet soil
    maxValue: int = 18200  # totally dry soil
    units = getUnits()
    for unit in units:
        for moistValue in moistValues:
            if unit["id"] == moistValue["id"]:
                if moistValue["status"] == "OK":
                    if moistValue["moistValue"] > maxValue:
                        if moistValue["moistValue"] > (maxValue + 1000):
                            unit["status"] = "ERROR"
                            unit["moistValue"] = round(moistValue["moistValue"] / 100) * 100
                        else:
                            unit["status"] = "OK"
                            unit["moistValue"] = maxValue

                    elif moistValue["moistValue"] < minValue:
                        if moistValue["moistValue"] < (minValue - 1000):
                            unit["status"] = "ERROR"
                            unit["moistValue"] = round(moistValue["moistValue"] / 100) * 100
                        else:
                            unit["status"] = "OK"
                            unit["moistValue"] = minValue
                    else:
                        unit["status"] = "OK"
                        unit["moistValue"] = round(moistValue["moistValue"] / 100) * 100

                else:
                    unit["status"] = "ERROR"
                    unit["moistValue"] = maxValue
    saveToDb(units)
