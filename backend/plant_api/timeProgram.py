from flask import current_app
from datetime import datetime
from time import monotonic
from .services.deviceSettings import getAll, getData
from .services.unitsDB import getUnits, updateMoistValuesToDB, updateLog
from .deviceFunctions import updateMoistValues, waterNow
import threading

testing = False
runTimeProgram = False
measureInterval: int


def setTestingMode(app):
    global testing
    with app.app_context():
        testing = current_app.testing


def setTimeProgram():
    settings = getAll()
    global runTimeProgram
    global measureInterval

    measureInterval = settings["moistMeasureInterval"]

    if settings["runTimeProgram"] is True and runTimeProgram is False:
        runTimeProgram = True

    if settings["runTimeProgram"] is False and runTimeProgram:
        runTimeProgram = False


def lastTimeWatered(unit):
    dateNow = datetime.now()
    lastTimeWateredDate = False
    for log in unit["logs"]:
        if log["watered"] == True:
            lastTimeWateredDate = log["date"]
            break
    if lastTimeWateredDate:
        lastWateredDate = datetime.strptime(lastTimeWateredDate, "%d.%m.%Y %H:%M:%S")

        return (
            abs((dateNow - lastWateredDate).days)
            if not testing
            else abs((dateNow - lastWateredDate).seconds)
        )

    return float("inf")


def timer():
    start_time = monotonic()

    while True:
        delay = (
            measureInterval * 86400 if not testing else measureInterval
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
            if not testing:
                moistValues = updateMoistValues()
                updateMoistValuesToDB(moistValues)
            units = getUnits()

            for unit in units[: getData("numberOfUnits")]:
                unitLog = {
                    "id": unit["id"],
                    "status": unit["status"],
                    "moistValue": unit["moistValue"],
                }
                if unit["enableAutoWatering"]:
                    wateredLastTime = lastTimeWatered(unit)
                    if (
                        unit["enableMinWaterInterval"] == True
                        and unit["minWaterInterval"] <= wateredLastTime
                    ):
                        status = waterNow(unit["id"])
                        message = "minimum watering interval" if not status["message"] else status["message"]
                        updateLog(
                            **unitLog,
                            watered=status["isWatered"],
                            waterMethod="auto",
                            message=message
                        )

                    elif unit["moistValue"] > unit["moistLimit"]:

                        if (
                            unit["enableMaxWaterInterval"] == True
                            and unit["maxWaterInterval"] >= wateredLastTime
                        ):
                            updateLog(**unitLog)
                            continue
                        if unit["status"] != "ERROR":
                            status = waterNow(unit["id"])
                            message = "moist level" if not status["message"] else status["message"]
                            updateLog(
                                **unitLog,
                                watered=True,
                                waterMethod="auto",
                                message=message                                  
                            )
                        else:
                            updateLog(**unitLog)

                    else:
                        updateLog(**unitLog)
                else:
                    updateLog(**unitLog)
            timer()


timeProgramThread = threading.Thread(target=timeProgram, daemon=True)
timeProgramThread.start()
