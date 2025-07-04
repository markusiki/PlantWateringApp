from flask import current_app
from .dbHelper import openDB, dumpDB
from datetime import datetime
from .deviceSettings import getData, updateWaterAmount

path: str
testing = False


# Converts moist value to scale 0-100 and back to unit["dryMoistValue"]-unit["wetMoistValue"] (100=wet)
def convertMoistValue(unit, value):
    inverseScaling = unit["dryMoistValue"] > unit["wetMoistValue"]

    def valueToRange(val, inMin, inMax, outMin, outMax):
        return round(outMin + (float(val - inMin) / float(inMax - inMin) * (outMax - outMin)))

    if value > 100:
        inMin = unit["wetMoistValue"] if inverseScaling else unit["dryMoistValue"]
        inMax = unit["dryMoistValue"] if inverseScaling else unit["wetMoistValue"]
        outMin = 100 if inverseScaling else 0
        outMax = 0 if inverseScaling else 100

    else:
        inMin = 100 if inverseScaling else 0
        inMax = 0 if inverseScaling else 100
        outMin = unit["wetMoistValue"] if inverseScaling else unit["dryMoistValue"]
        outMax = unit["dryMoistValue"] if inverseScaling else unit["wetMoistValue"]

    return valueToRange(value, inMin, inMax, outMin, outMax)


def setUnitsDB(app):
    global path
    global testing
    with app.app_context():
        path = current_app.config["UNITS_DB"]
        testing = current_app.testing


def getUnits(innerUse=True):
    units = openDB(path)
    if innerUse:
        return units
    else:
        numberOfUnits = getData("numberOfUnits")
        for unit in units[:numberOfUnits]:
            unit.pop("sensor")
            unit.pop("valve")
            unit["moistValue"] = convertMoistValue(unit, unit["moistValue"])
            unit["moistLimit"] = convertMoistValue(unit, unit["moistLimit"])
            unit.pop("maxPstdev")
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
    dumpDB(path, units)


def modifyUnitToDB(unitToChange, index):
    units = getUnits()
    unit = units[index]
    unit["name"] = unitToChange["name"]
    unit["moistLimit"] = convertMoistValue(unit, int(unitToChange["moistLimit"]))
    unit["waterTime"] = int(unitToChange["waterTime"])
    unit["enableAutoWatering"] = unitToChange["enableAutoWatering"]
    unit["enableMaxWaterInterval"] = unitToChange["enableMaxWaterInterval"]
    unit["enableMinWaterInterval"] = unitToChange["enableMinWaterInterval"]
    unit["maxWaterInterval"] = unitToChange["maxWaterInterval"]
    unit["minWaterInterval"] = unitToChange["minWaterInterval"]
    unit["waterFlowRate"] = unitToChange["waterFlowRate"]
    saveToDb(units)
    changedUnits = getUnits(innerUse=False)
    changedUnit = changedUnits[index]
    return changedUnit


def updateLog(id="", status="", moistValue=0, watered=False, waterMethod="", message=""):
    timeStamp = datetime.now().strftime("%d.%m.%Y %H:%M:%S")
    units = getUnits()
    index = findById(id)
    unit = units[index]
    if watered:
        wateringAmount = round(unit["waterFlowRate"] * unit["waterTime"], 3)
        unit["totalWateredAmount"] += wateringAmount
        updateWaterAmount(wateringAmount)
    logs = unit["logs"]
    newLog = {
        "date": timeStamp,
        "moistValue": convertMoistValue(unit, moistValue),
        "status": status,
        "watered": watered,
        "waterMethod": waterMethod,
        "message": message,
    }
    logs.insert(0, newLog)
    saveToDb(units)


def deleteLog(id):
    units = getUnits()
    index = findById(id)
    unit = units[index]
    unit["logs"] = []
    saveToDb(units)


def analyzeMoistValue(unit, moistValue):
    inverseScaling = unit["dryMoistValue"] > unit["wetMoistValue"]
    upperLimit = unit["dryMoistValue"] if inverseScaling else unit["wetMoistValue"]
    lowerLimit = unit["wetMoistValue"] if inverseScaling else unit["dryMoistValue"]

    if moistValue["moistValue"] > upperLimit:
        unit["status"] = (
            "ERROR: Moisture sensor may not be in soil."
            if inverseScaling
            else "ERROR: The soil may be floading."
        )
        unit["moistValue"] = upperLimit
    elif moistValue["moistValue"] < lowerLimit:
        unit["status"] = (
            "ERROR: Watering unit may not be connected or the soil is floading."
            if inverseScaling
            else "ERROR: Watering unit may not be connected."
        )
        unit["moistValue"] = lowerLimit
    else:
        unit["status"] = "OK" if moistValue["status"] == "OK" else moistValue["status"]
        unit["moistValue"] = round(moistValue["moistValue"] / 100) * 100

    return unit


def updateMoistValuesToDB(moistValues):
    units = getUnits()
    for unit in units:
        for moistValue in moistValues:
            if unit["id"] == moistValue["id"]:
                analyzeMoistValue(unit, moistValue)

    saveToDb(units)


def clearWaterCounter(unitId):
    units = getUnits()
    index = findById(unitId)
    units[index]["totalWateredAmount"] = 0
    saveToDb(units)


def calibrateUnitMoistValue(unitMoistValue, moistValueType):
    units = getUnits()
    index = findById(unitMoistValue["id"])
    units[index][moistValueType] = unitMoistValue["moistValue"]
    units[index]["maxPstdev"] = unitMoistValue["standardDeviation"]
    saveToDb(units)
