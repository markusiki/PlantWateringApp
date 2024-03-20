from time import sleep
import gpiozero
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from services import db as dbService
from statistics import pstdev

# Initialize the I2C interface
i2c = busio.I2C(board.SCL, board.SDA)

# Create an ADS1115 object
ads = ADS.ADS1115(i2c)


class Pump:
    def __init__(self, power, pwm):
        self.power = gpiozero.OutputDevice(power, active_high=False, initial_value=False)
        self.pwm = gpiozero.PWMOutputDevice(pin=pwm, frequency=100)


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


pump = Pump(4, 17)
sprinkler_unit_objects = []
units = dbService.getSprinklerUnits()
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


def updateSprinklerUnitObject(id, index):
    units = dbService.getSprinklerUnits()
    updatedUnit = units[index]
    for unit in sprinkler_unit_objects:
        if unit.id == id:
            result = unit.update(
                updatedUnit["moistValue"],
                updatedUnit["moistLimit"],
                updatedUnit["waterTime"],
            )
    return {"message": "saved"}


def updateMoistValues():
    moistValues = []
    for unit in sprinkler_unit_objects:
        moistValues.append(measureSoil(unit.id))
    return moistValues


def waterNow(id):
    index = dbService.findById(id)
    unit = sprinkler_unit_objects[index]
    moistValue = measureSoil(id)
    water(unit.valve, unit.id, unit.waterTime)

    return moistValue


def calculateStandardDeviation(values):
    standardDeviation = pstdev(values)
    if standardDeviation > 200:
        return "ERROR"
    return "OK"


def measureSoil(id):
    values = []
    valueSum = 0
    for unit in sprinkler_unit_objects:
        if unit.id == id:
            for i in range(5):
                value = unit.sensor.value
                values.append(value)
                valueSum += value
                sleep(0.1)
            pstdev = calculateStandardDeviation(values)
            valueMean = valueSum / 5

    return {"id": id, "status": pstdev, "moistValue": valueMean}


def water(valve, id, waterTime):
    valve.on()
    sleep(waterTime)
    valve.off()


def getObjects():
    return sprinkler_unit_objects
