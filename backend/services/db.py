import json
from datetime import datetime

db = "unitsDB.json"


def getUnits(innerUse=True):
    file = open(db, "r")
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
    file = open(db, "r")
    units = json.load(file)
    file.close()
    index = -1
    for i, unit in enumerate(units):
        if unit["id"] == id:
            index = i

    if index != -1:
        return index


def getById(id):
    file = open(db, "r")
    units = json.load(file)
    file.close()
    for element in units:
        if element["id"] == id:
            return element


def saveToDb(units):
    file = open(db, "w")
    json.dump(units, file)
    file.close()


def changeUnit(unitToChange, index):
    file = open(db, "r")
    units = json.load(file)
    file.close()
    unit = units[index]
    unit["name"] = unitToChange["name"]
    unit["moistLimit"] = int(unitToChange["moistLimit"])
    unit["waterTime"] = int(unitToChange["waterTime"])
    unit["enableMaxWaterInterval"] = unitToChange["enableMaxWaterInterval"]
    unit["enableMinWaterInterval"] = unitToChange["enableMinWaterInterval"]
    unit["maxWaterInterval"] = unitToChange["maxWaterInterval"]
    unit["minWaterInterval"] = unitToChange["minWaterInterval"]
    saveToDb(units)
    file = open(db, "r")
    changedUnits = json.load(file)
    file.close()
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


def updateMoistValues(moistValues):
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


def getSprinklerUnits():
    file = open(db)
    units = json.load(file)
    file.close()
    return units
