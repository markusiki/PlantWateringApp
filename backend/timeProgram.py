from datetime import datetime, date
from time import monotonic
import services.deviceSettings as deviceSettings
import services.db as dbService
import deviceFunctions as device
import threading
import concurrent.futures

runTimeProgram = False
measureInterval: int


def setTimeProgram():
    settings = deviceSettings.getAll()
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
        delay = measureInterval * 86400  # days converted to seconds (86400)
        current_time = monotonic()
        epsaled_time = current_time - start_time
        if epsaled_time >= delay:
            break


def timeProgram():
    while True:
        if runTimeProgram:
            units = dbService.getUnits()
            moistValues = device.updateMoistValues()
            dbService.updateMoistValues(moistValues)

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
                    device.waterNow(unit["id"])
                    dbService.updateLog(
                        **unitLog, watered=True, waterMethod="auto: max watering interval"
                    )

                elif unit["moistValue"] > unit["moistLimit"]:
                    if (
                        unit["enableMinWaterInterval"] == True
                        and unit["minWaterInterval"] >= wateredLastTime
                    ):
                        dbService.updateLog(**unitLog)
                        continue
                    device.waterNow(unit["id"])
                    dbService.updateLog(**unitLog, watered=True, waterMethod="auto: moist level")

                else:
                    dbService.updateLog(**unitLog)
            timer()


time_program = threading.Thread(target=timeProgram, daemon=True)
time_program.start()

setTimeProgram()
