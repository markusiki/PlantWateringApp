from time import sleep
import services.deviceSettings as deviceSettings
import deviceFunctions as device
import threading

runTimeProgram = False
measureIntervall: int


def setTimeProgram():
    settings = deviceSettings.getAll()
    global runTimeProgram
    global measureIntervall
    measureIntervall = settings["moistMeasureIntervall"]
    if settings["autoWatering"] is True and runTimeProgram is False:
        runTimeProgram = True
        timeProgramThread = threading.Thread(target=timeProgram)
        timeProgramThread.start()

    if settings["autoWatering"] is False and runTimeProgram:
        runTimeProgram = False


def timeProgram():
    while True:
        global runTimeProgram
        if runTimeProgram:
            units = device.getObjects()
            for unit in units:
                sensor = device.measureSoil(unit.sensor, unit.id)
                print((unit.id, unit.moistLimit, sensor))
                if sensor["value"] > unit.moistLimit:
                    device.water(unit.valve, unit.id, unit.waterTime)
                    print(f"Watering unit {unit.id}")
            sleep(measureIntervall)
        else:
            break


setTimeProgram()
