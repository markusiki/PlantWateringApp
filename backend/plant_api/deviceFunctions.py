from flask import current_app
from time import sleep
import gpiozero
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from .services.unitsDB import getUnits, findById
from .services.deviceSettings import getNumberOfUnits
from statistics import pstdev
import json

# Initialize the I2C interface
i2c = busio.I2C(board.SCL, board.SDA)

# Create an ADS1115 object
ads = ADS.ADS1115(i2c)

testing = False


def setTestingMode(app):
    global testing
    with app.app_context():
        testing = current_app.testing


class Pump:
    def __init__(self, power, pwm):
        self.power = gpiozero.OutputDevice(pin=power, active_high=False, initial_value=False)

    def pumpOn(self):
        self.power.on()

    def pumpOff(self):
        self.power.off()


class Sprinkler_unit:
    def __init__(self, id, valve, sensor, moistValue, moistLimit, waterTime):
        self.id = id
        self.valve = gpiozero.OutputDevice(valve, active_high=False, initial_value=False)
        self.sensor = AnalogIn(ads, eval(sensor))
        self.moistValue = moistValue
        self.moistLimit = moistLimit
        self.waterTime = waterTime

    def update(self, moistValue, moistLimit, waterTime):
        self.moistValue = moistValue
        self.moistLimit = moistLimit
        self.waterTime = waterTime
        return


pump = Pump(17, 4)


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
        )
    )

sprinkler_units_in_use = sprinkler_unit_objects


def setUnitObjects():
    global sprinkler_units_in_use
    sprinkler_units_in_use = sprinkler_unit_objects[: getNumberOfUnits()]


def updateSprinklerUnitObject(id, index):
    units = getUnits()
    updatedUnit = units[index]
    for unit in sprinkler_units_in_use:
        if unit.id == id:
            unit.update(
                updatedUnit["moistValue"],
                updatedUnit["moistLimit"],
                updatedUnit["waterTime"],
            )
    return {"message": "saved"}


def updateMoistValues():
    moistValues = []
    for unit in sprinkler_units_in_use:
        moistValues.append(measureSoil(unit.id))
    return moistValues


def waterNow(id):
    index = findById(id)
    unit = sprinkler_units_in_use[index]
    moistValue = measureSoil(id)
    water(unit.valve, unit.waterTime)

    return moistValue


def calculateStandardDeviation(values):
    standardDeviation = pstdev(values)
    if standardDeviation > 200:
        return "ERROR"
    return "OK"


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

    return {"id": id, "status": pstdev, "moistValue": valueMean}


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
