from time import sleep
import gpiozero
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
import services.db as dbService

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
  print(unit)
  sprinkler_unit_objects.append(Sprinkler_unit(unit["id"], unit["valve"], unit["sensor"], unit["moistLevel"], unit["moistLimit"], unit["waterTime"]))

def updateSprinklerUnitObject(id, index):
  units = dbService.getSprinklerUnits()
  updatedUnit = units[index]
  for unit in sprinkler_unit_objects:
    if unit.id == id:
      result = unit.update(updatedUnit["moistLevel"], updatedUnit["moistLimit"], updatedUnit["waterTime"])
  return {"message": "saved"}

def updateMoistLevels():
  moistLevels = []
  for unit in sprinkler_unit_objects:
    moistLevels.append(measureSoil(unit.sensor, unit.id))
  return moistLevels

def waterNow(id):
    index = dbService.findById(id)
    unit = sprinkler_unit_objects[index]
    result = water(unit.valve, unit.id, unit.waterTime)
    return result

def measureSoil(sensor, id):
    #FIX!!
    valueSum = 0
    for i in range(5):
      valueSum += sensor.value
      sleep(0.1)
    valueMean = valueSum / 5

    return {"id": id, "value": valueMean}

def water(valve, id, waterTime):
    valve.on()
    sleep(waterTime)
    valve.off()
    return {"message": f"Watered unit {id}"}

def getObjects():
   return sprinkler_unit_objects


