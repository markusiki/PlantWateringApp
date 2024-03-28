from datetime import datetime, date
from time import sleep
import services.deviceSettings as deviceSettings
import services.db as dbService
import deviceFunctions as device
import threading

runTimeProgram = False
measureInterval: int


def setTimeProgram():
    settings = deviceSettings.getAll()
    global runTimeProgram
    global measureInterval
    measureInterval = settings["moistMeasureInterval"]
    if settings["autoWatering"] is True and runTimeProgram is False:
        runTimeProgram = True
        timeProgramThread = threading.Thread(target=timeProgram)
        timeProgramThread.start()

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
        lastWateredDate = datetime.strptime(lastTimeWateredDate, "%d.%m.%y %H:%M")
        print(abs((dateNow - lastWateredDate).days))
        return abs((dateNow - lastWateredDate).days)

    return float("inf")


def timeProgram():
    while True:
        global runTimeProgram

        if runTimeProgram == True:
            units = dbService.getUnits()
            for unit in units:
                moistValues = device.updateMoistValues()
                dbService.updateMoistValues(moistValues)
                unitLog = {
                    "id": unit["id"],
                    "status": unit["status"],
                    "moistValue": unit["moistValue"],
                }
                if unit["status"] == "OK":
                    wateredLastTime = lastTimeWatered(unit)
                    if (
                        unit["enableMaxWaterInterval"] == True
                        and unit["maxWaterInterval"] <= wateredLastTime
                    ):
                        device.waterNow(unit["id"])
                        dbService.updateLog(
                            **unitLog, watered=True, waterMethod="auto: maxWaterInterval"
                        )
                        print(f'Watering unit {unit["id"]}')
                    elif unit["moistValue"] > unit["moistLimit"]:
                        if (
                            unit["enableMinWaterInterval"] == True
                            and unit["minWaterInterval"] >= wateredLastTime
                        ):
                            dbService.updateLog(**unitLog)
                            continue
                        device.waterNow(unit["id"])
                        dbService.updateLog(**unitLog, watered=True, waterMethod="auto: moistLevel")
                        print(f'Watering unit {unit["id"]}')
                    else:
                        dbService.updateLog(**unitLog)
                else:
                    dbService.updateLog(**unitLog)
            sleep(measureInterval * 3600)  # days converted to seconds
        else:
            break


setTimeProgram()
