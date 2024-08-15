from flask import current_app
from datetime import datetime
from time import monotonic
from .services.deviceSettings import getAll
from .services.db import getUnits, updateMoistValuesToDB, updateLog
from .deviceFunctions import updateMoistValues, waterNow
import threading

TESTING = False
runTimeProgram = False
measureInterval: int


def setTestingMode(app):
    global TESTING
    with app.app_context():
        TESTING = current_app.testing


def setTimeProgram():
    settings = getAll()
    global runTimeProgram
    global measureInterval

    measureInterval = settings["moistMeasureInterval"]

    if settings["autoWatering"] is True and runTimeProgram is False:
        runTimeProgram = True

    if settings["autoWatering"] is False and runTimeProgram:
        runTimeProgram = False


def lastTimeWatered(unit):
    dateNow = datetime.now()
    lastTimeWateredDate = False
    for log in unit["logs"]:
        if log["watered"] == True:
            lastTimeWateredDate = log["date"]
            break
    if lastTimeWateredDate:
        lastWateredDate = datetime.strptime(lastTimeWateredDate, "%d.%m.%Y %H:%M")

        return abs((dateNow - lastWateredDate).days)

    return float("inf")


def timer():
    start_time = monotonic()

    while True:
        delay = (
            measureInterval * 86400 if not TESTING else measureInterval
        )  # days converted to seconds if not testing (86400)
        current_time = monotonic()
        epsaled_time = current_time - start_time
        if epsaled_time >= delay:
            break
        if runTimeProgram is False:
            break


def timeProgram():
    while True:
        if runTimeProgram:
            moistValues = updateMoistValues()
            updateMoistValuesToDB(moistValues)
            units = getUnits()

            for unit in units:
                unitLog = {
                    "id": unit["id"],
                    "status": unit["status"],
                    "moistValue": unit["moistValue"],
                }
                wateredLastTime = lastTimeWatered(unit)
                if (
                    unit["enableMaxWaterInterval"] == True
                    and unit["maxWaterInterval"] <= wateredLastTime
                ):
                    waterNow(unit["id"])
                    updateLog(**unitLog, watered=True, waterMethod="auto: max watering interval")

                elif unit["moistValue"] > unit["moistLimit"]:
                    if (
                        unit["enableMinWaterInterval"] == True
                        and unit["minWaterInterval"] >= wateredLastTime
                    ):
                        updateLog(**unitLog)
                        continue
                    elif unit["status"] != "ERROR":
                        waterNow(unit["id"])
                        updateLog(**unitLog, watered=True, waterMethod="auto: moist level")

                else:
                    updateLog(**unitLog)
            timer()


time_program = threading.Thread(target=timeProgram, daemon=True)
time_program.start()

setTimeProgram()
