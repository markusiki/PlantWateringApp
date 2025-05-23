from flask import current_app
from time import sleep
import gpiozero
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from .services.unitsDB import getUnits, findById
from .services.deviceSettings import getData
from statistics import pstdev

# Initialize the I2C interface
i2c = busio.I2C(board.SCL, board.SDA)

# Create an ADS1115 object
ads = ADS.ADS1115(i2c)

testing = False
wateringStatus = {"watering": False, "method": "", "id": ""}


def setTestingMode(app):
    global testing
    with app.app_context():
        testing = current_app.testing


class Pump:
    def __init__(self, power):
        self.power = gpiozero.OutputDevice(pin=power, active_high=False, initial_value=False)

    def pumpOn(self):
        self.power.on()

    def pumpOff(self):
        self.power.off()


class Sprinkler_unit:
    def __init__(self, id, valve, sensor, moistValue, moistLimit, waterTime, waterFlowRate):
        self.id = id
        self.valve = gpiozero.OutputDevice(valve, active_high=False, initial_value=False)
        self.sensor = AnalogIn(ads, eval(sensor))
        self.moistValue = moistValue
        self.moistLimit = moistLimit
        self.waterTime = waterTime
        self.waterFlowRate = waterFlowRate

    def update(self, moistValue, moistLimit, waterTime, waterFlowRate):
        self.moistValue = moistValue
        self.moistLimit = moistLimit
        self.waterTime = waterTime
        self.waterFlowRate = waterFlowRate
        return


pump = Pump(17)


sprinkler_unit_objects = []
units = getUnits()
for unit in units:
    sprinkler_unit_objects.append(
        Sprinkler_unit(
            unit["id"],
            unit["valve"],
            unit["sensor"],
            unit["moistValue"],
            unit["moistLimit"],
            unit["waterTime"],
            unit["waterFlowRate"],
        )
    )

sprinkler_units_in_use = sprinkler_unit_objects


def setUnitObjects():
    global sprinkler_units_in_use
    sprinkler_units_in_use = sprinkler_unit_objects[: getData("numberOfUnits")]


def updateSprinklerUnitObject(id, index):
    units = getUnits()
    updatedUnit = units[index]
    for unit in sprinkler_units_in_use:
        if unit.id == id:
            unit.update(
                updatedUnit["moistValue"],
                updatedUnit["moistLimit"],
                updatedUnit["waterTime"],
                updatedUnit["waterFlowRate"],
            )
    return {"message": "saved"}


def updateMoistValues():
    moistValues = []
    for unit in sprinkler_units_in_use:
        moistValues.append(measureSoil(unit.id))
    return moistValues


def waterNow(id, manual=False):
    global wateringStatus
    if manual and wateringStatus["watering"]:
        return {"isWatered": False, "message": f"{wateringStatus['method']} watering of unit {wateringStatus['id']} in process."}
    if not manual and wateringStatus["watering"]:
        if wateringStatus["id"] == id:
            return {"isWatered": False, "message": f"Manual waterign of {id} in process."}
        else:
            while wateringStatus["watering"]:
                sleep(1)
    index = findById(id)
    unit = sprinkler_units_in_use[index]
    waterAmountLeft = getData("waterAmount")
    if (unit.waterFlowRate * unit.waterTime) >= waterAmountLeft:
        return {"isWatered": False, "message": "Not enough water"}

    wateringStatus["watering"] = True
    wateringStatus["method"] = "Manual" if manual else "Auto"
    wateringStatus["id"] = id
    water(unit.valve, unit.waterTime)
    wateringStatus["watering"] = False
    wateringStatus["method"] = ""
    wateringStatus["id"] = ""
    return {"isWatered": True, "message": f"Watering of unit {id} completed successfully." if manual else ""}


def calculateStandardDeviation(values):
    status = "OK"
    standardDeviation = pstdev(values)
    if standardDeviation > 500:
        status = (
            "ERROR: Watering unit may not be connected or the moisture sensor may be defective."
        )
    return {"status": status, "value": standardDeviation}


def measureSoil(id):
    values = []
    valueSum = 0
    for unit in sprinkler_units_in_use:
        if unit.id == id:
            for i in range(5):
                value = unit.sensor.value
                values.append(value)
                valueSum += value
                sleep(0.05)
            pstdev = calculateStandardDeviation(values)
            valueMean = valueSum / 5

    return {
        "id": id,
        "status": pstdev["status"],
        "standardDeviation": pstdev["value"],
        "moistValue": valueMean,
    }


def water(valve, waterTime):
    valve.on()
    if not testing:
        pump.pumpOn()
    sleep(waterTime)
    if not testing:
        pump.pumpOff()
    valve.off()


def getObjects():
    return sprinkler_units_in_use
