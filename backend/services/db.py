import json

db = "unitsDB.json"


def getUnits():
    file = open(db)
    units = json.load(file)
    file.close()
    for unit in units:
        unit.pop("sensor")
        unit.pop("valve")
    return units


def findById(id):
    file = open(db, "r")
    units = json.load(file)
    index = -1
    for i, unit in enumerate(units):
        if unit["id"] == id:
            index = i

    if index != -1:
        return index


def saveToDb(units):
    file = open(db, "w")
    json.dump(units, file)
    file.close()


def changeUnit(unitToChange, index):
    file = open(db, "r")
    units = json.load(file)
    unit = units[index]
    unit["name"] = unitToChange["name"]
    unit["moistLimit"] = int(unitToChange["moistLimit"])
    unit["waterTime"] = int(unitToChange["waterTime"])
    saveToDb(units)
    file = open(db, "r")
    changedUnits = json.load(file)
    file.close()
    changedUnit = changedUnits[index]
    return changedUnit


def updateMoistLevels(moistLevels):
    minValue: int = 10000  # totally wet soil
    maxValue: int = 18000  # totally dry soil
    file = open(db, "r")
    units = json.load(file)
    for unit in units:
        for moistLevel in moistLevels:
            if unit["id"] == moistLevel["id"]:
                if moistLevel["status"] == "OK":
                    if moistLevel["value"] > maxValue:
                        if moistLevel["value"] > (maxValue + 1000):
                            unit["status"] = "ERROR"
                            unit["moistLevel"] = maxValue
                        else:
                            unit["status"] = "OK"
                            unit["moistLevel"] = maxValue
                    elif moistLevel["value"] < minValue:
                        if moistLevel["value"] < (minValue - 1000):
                            unit["status"] = "ERROR"
                            unit["moistLevel"] = minValue
                            continue
                        else:
                            unit["status"] = "OK"
                            unit["moistLevel"] = minValue
                    else:
                        unit["status"] = "OK"
                        unit["moistLevel"] = round(moistLevel["value"] / 100) * 100
                else:
                    unit["status"] = "ERROR"
                    unit["moistLevel"] = maxValue

    saveToDb(units)


def getSprinklerUnits():
    file = open(db)
    units = json.load(file)
    file.close()
    return units
