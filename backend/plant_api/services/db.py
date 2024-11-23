from flask import current_app
import json
from datetime import datetime
from .deviceSettings import getNumberOfUnits

path: str
testing = False

minMoistValue: int = 8000  # totally wet soil
maxMoistValue: int = 18200  # totally dry soil


# Converts moist value to scale 0-100 and back to maxMoistValue-minMoistValue (100=wet)
def convertMoistValue(value):
    if value > 100:
        convertedValue = round(
            100 - (value - minMoistValue) / (maxMoistValue - minMoistValue) * 100
        )
        return convertedValue
    else:
        convertedValue = round(
            (100 - value) * (maxMoistValue - minMoistValue) / 100 + minMoistValue
        )
        return convertedValue


def setUnitsDB(app):
    global path
    global testing
    with app.app_context():
        path = current_app.config["UNITS_DB"]
        testing = current_app.testing


def getUnits(innerUse=True):
    file = open(path, "r")
    units = json.load(file)
    file.close()
    if innerUse:
        return units
    else:
        numberOfUnits = getNumberOfUnits()
        for unit in units[:numberOfUnits]:
            unit.pop("sensor")
            unit.pop("valve")
            unit["moistValue"] = convertMoistValue(unit["moistValue"])
            unit["moistLimit"] = convertMoistValue(unit["moistLimit"])
            if not testing:
                for log in unit["logs"]:
                    log["date"] = datetime.strftime(
                        datetime.strptime(log["date"], "%d.%m.%Y %H:%M:%S"), "%d.%m.%Y %H:%M"
                    )

        return units[:numberOfUnits]


def findById(id):
    units = getUnits()
    index = -1
    for i, unit in enumerate(units):
        if unit["id"] == id:
            index = i

    if index != -1:
        return index


def getById(id, innerUse=True):
    units = getUnits(innerUse)
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
    unit["moistLimit"] = convertMoistValue(int(unitToChange["moistLimit"]))
    unit["waterTime"] = int(unitToChange["waterTime"])
    unit["enableAutoWatering"] = unitToChange["enableAutoWatering"]
    unit["enableMaxWaterInterval"] = unitToChange["enableMaxWaterInterval"]
    unit["enableMinWaterInterval"] = unitToChange["enableMinWaterInterval"]
    unit["maxWaterInterval"] = unitToChange["maxWaterInterval"]
    unit["minWaterInterval"] = unitToChange["minWaterInterval"]
    saveToDb(units)
    changedUnits = getUnits(innerUse=False)
    changedUnit = changedUnits[index]
    return changedUnit


def updateLog(id="", status="", moistValue=0, watered=False, waterMethod=""):
    timeStamp = datetime.now().strftime("%d.%m.%Y %H:%M:%S")
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

    units = getUnits()
    for unit in units:
        for moistValue in moistValues:
            if unit["id"] == moistValue["id"]:
                if moistValue["moistValue"] > maxMoistValue:
                    if moistValue["moistValue"] > (maxMoistValue + 1000):
                        unit["status"] = "ERROR"
                        unit["moistValue"] = round(moistValue["moistValue"] / 100) * 100
                    else:
                        unit["status"] = "OK" if moistValue["status"] == "OK" else "ERROR"
                        unit["moistValue"] = maxMoistValue

                elif moistValue["moistValue"] < minMoistValue:
                    if moistValue["moistValue"] < (minMoistValue - 1000):
                        unit["status"] = "ERROR"
                        unit["moistValue"] = round(moistValue["moistValue"] / 100) * 100
                    else:
                        unit["status"] = "OK" if moistValue["status"] == "OK" else "ERROR"
                        unit["moistValue"] = minMoistValue
                else:
                    unit["status"] = "OK" if moistValue["status"] == "OK" else "ERROR"
                    unit["moistValue"] = round(moistValue["moistValue"] / 100) * 100

    saveToDb(units)
