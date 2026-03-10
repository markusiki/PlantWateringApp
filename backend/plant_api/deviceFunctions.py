from time import sleep
from datetime import datetime
import gpiozero
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from .services.unitsDB import getUnits, findById
from .services.deviceSettings import getData
from statistics import pstdev

FLOW_SENSOR_GPIO = 5
PUMP_SENSOR_GPIO = 17

# Initialize the I2C interface
i2c = busio.I2C(board.SCL, board.SDA)

# Create an ADS1115 object
ads = ADS.ADS1115(i2c)

wateringStatus = {"watering": False, "method": "", "id": ""}
cancelWateringFlag = False


class Pump:
    def __init__(self):
        self.power = gpiozero.OutputDevice(
            pin=PUMP_SENSOR_GPIO, active_high=False, initial_value=False
        )

    def pumpOn(self):
        self.power.on()

    def pumpOff(self):
        self.power.off()


class Sprinkler_unit:
    def __init__(
        self,
        id,
        valve,
        sensor,
        moistValue,
        moistLimit,
        waterTime,
        waterAmount,
        waterFlowRate,
        wateringMode,
    ):
        self.id = id
        self.valve = gpiozero.OutputDevice(valve, active_high=False, initial_value=False)
        self.sensor = AnalogIn(ads, eval(sensor))
        self.moistValue = moistValue
        self.moistLimit = moistLimit
        self.waterTime = waterTime
        self.waterAmount = waterAmount
        self.waterFlowRate = waterFlowRate
        self.wateringMode = wateringMode

    def update(self, moistValue, moistLimit, waterTime, waterAmount, waterFlowRate, wateringMode):
        self.moistValue = moistValue
        self.moistLimit = moistLimit
        self.waterFlowRate = waterFlowRate
        self.wateringMode = wateringMode
        self.waterTime = waterTime if wateringMode == "time" else waterAmount / waterFlowRate
        self.waterAmount = waterAmount if wateringMode == "amount" else waterTime * waterFlowRate
        return


class FlowMeter:
    def __init__(self, pulsesPerLitre):
        self.pin = gpiozero.DigitalInputDevice(pin=FLOW_SENSOR_GPIO)
        self.pin.when_activated = self.countPulse
        self.pulsesPerLitre = pulsesPerLitre
        self.pulseCount = 0
        self.flowRates = []

    def countPulse(self):
        self.pulseCount += 1

    def clearCounters(self):
        self.pulseCount = 0
        self.flowRates = []

    def getData(self):
        waterAmount = round(self.pulseCount / self.pulsesPerLitre, 2)
        avgFlowRate = (
            round(sum(self.flowRates) / len(self.flowRates), 2) if len(self.flowRates) else 0
        )
        lastFlowRate = self.flowRates[-1] if len(self.flowRates) > 0 else 0
        self.clearCounters()
        return {
            "waterAmount": waterAmount,
            "avgFlowRate": avgFlowRate,
            "lastFlowRate": lastFlowRate,
        }

    def getCurrentWateredAmount(self):
        return round(self.pulseCount / self.pulsesPerLitre, 2)

    def getCurrentFlowRate(self):
        measureTime = 0.5
        count_a = self.pulseCount
        sleep(measureTime)
        count_b = self.pulseCount
        flowRate = round((count_b - count_a) / self.pulsesPerLitre / measureTime, 2)
        self.flowRates.append(flowRate)
        return flowRate


pump = Pump()
flowMeter = FlowMeter(getData("flowSensorPulsesPerLiter"))

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
            unit["waterAmount"],
            unit["waterFlowRate"],
            unit["wateringMode"],
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
                updatedUnit["waterAmount"],
                updatedUnit["waterFlowRate"],
                updatedUnit["wateringMode"],
            )
    return {"message": "saved"}


def updateFlowSensor():
    flowMeter.pulsesPerLitre = getData("flowSensorPulsesPerLiter")


def updateMoistValues():
    moistValues = []
    for unit in sprinkler_units_in_use:
        moistValues.append(measureSoil(unit.id))
    return moistValues


def cancelWatering(id):
    global wateringStatus
    global cancelWateringFlag
    if (
        wateringStatus["watering"]
        and wateringStatus["method"] == "Manual"
        and wateringStatus["id"] == id
    ):
        cancelWateringFlag = True
        return {"message": f"Cancelling watering process for unit {id}"}
    else:
        return {"message": f"No manual watering process in progress for unit {id}"}


def waterNow(id, manual=False):
    global wateringStatus
    global cancelWateringFlag
    if manual and wateringStatus["watering"]:
        return {
            "isWatered": False,
            "message": f"{wateringStatus['method']} watering of unit{wateringStatus['id']} in process.",
        }
    if not manual and wateringStatus["watering"]:
        if wateringStatus["id"] == id:
            return {"isWatered": False, "message": f"Manual watering of {id} in process."}
        else:
            while wateringStatus["watering"]:
                sleep(1)
    index = findById(id)
    unit = sprinkler_units_in_use[index]
    waterAmountLeft = getData("waterAmount")
    useFlowSensor = getData("useFlowSensor")
    if not useFlowSensor and (unit.waterFlowRate * unit.waterTime) >= waterAmountLeft:
        return {"isWatered": False, "message": "Not enough water"}

    wateringStatus["watering"] = True
    wateringStatus["method"] = "Manual" if manual else "Auto"
    wateringStatus["id"] = id
    water(unit)
    message = ""
    if useFlowSensor:
        flowMeterData = flowMeter.getData()
        if flowMeterData["lastFlowRate"] == 0:
            message = "Run out of water while watering."
        if flowMeterData["avgFlowRate"] == 0:
            message = "Flow sensor did not detect any water flow."
        else:
            unit.waterFlowRate = flowMeterData["avgFlowRate"]

    if cancelWateringFlag:
        message = "Watering cancelled by user."
        cancelWateringFlag = False

    wateringStatus["watering"] = False
    wateringStatus["method"] = ""
    wateringStatus["id"] = ""
    return {
        "isWatered": True,
        "message": message,
        "wateredAmount": flowMeterData["waterAmount"] if useFlowSensor else 0,
        "flowRate": flowMeterData["avgFlowRate"] if useFlowSensor else 0,
    }


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


def isWaterFlowing():
    if flowMeter.getCurrentFlowRate() == 0:
        sleep(2)
        if flowMeter.getCurrentFlowRate() == 0:
            return False
    return True


def water(unit):
    global cancelWateringFlag
    unit.valve.on()
    pump.pumpOn()
    useFlowSensor = getData("useFlowSensor")
    if useFlowSensor:
        if unit.wateringMode == "time":
            for _ in range(int(unit.waterTime)):
                if not isWaterFlowing() or cancelWateringFlag:
                    break
                sleep(1)
        elif unit.wateringMode == "amount":
            while True:
                if flowMeter.getCurrentWateredAmount() >= unit.waterAmount:
                    break

                if not isWaterFlowing() or cancelWateringFlag:
                    break
    else:
        if unit.wateringMode == "time":
            sleep(unit.waterTime)
        elif unit.wateringMode == "amount":
            sleep(unit.waterAmount / unit.waterFlowRate)

    pump.pumpOff()
    unit.valve.off()


def getObjects():
    return sprinkler_units_in_use
