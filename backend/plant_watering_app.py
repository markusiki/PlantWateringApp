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
  def __init__(self, id, valve, sensor, moisture_value, water_time):
    self.id = id
    self.valve = gpiozero.OutputDevice(valve, active_high=False, initial_value=False)
    self.sensor = AnalogIn(ads, eval(sensor))
    self.moisture_value = moisture_value
    self.water_time = water_time

  def update(self, moisture_value, water_time):
    self.moisture_value = moisture_value
    self.water_time = water_time
    return

pump = Pump(4, 17)
sprinkler_unit_objects = []
units = dbService.getSprinklerUnits()
for unit in units:
  sprinkler_unit_objects.append(Sprinkler_unit(unit["id"], unit["valve"], unit["sensor"], unit["moistLevel"], unit["waterTime"]))

def updateSprinklerUnitObject(id, index):
  units = dbService.getSprinklerUnits()
  updatedUnit = units[index]
  for unit in sprinkler_unit_objects:
    if unit.id == id:
      result = unit.update(updatedUnit["moistLevel"], updatedUnit["waterTime"])
  return {"message": "saved"}

def updateMoistLevels():
  moistLevels = []
  for unit in sprinkler_unit_objects:
    moistLevels.append(measureSoil(unit.sensor, unit.id))
  return moistLevels

def waterNow(id):
    index = dbService.findById(id)
    unit = sprinkler_unit_objects[index]
    result = water(unit.valve, unit.id, unit.water_time)
    return result

def measureSoil(sensor, id):
    value = sensor.value
    return {"id": id, "value": value}

def water(valve, id, water_time):
    valve.on()
    sleep(water_time)
    valve.off()
    return {"message": f"Watered unit {id}"}

""" def main():
    while True:
        for sprinkler_unit in sprinkler_units:
            value = measureSoil(sprinkler_unit.sensor, sprinkler_unit.id)
            if value > sprinkler_unit.moisture_value:
                water(sprinkler_unit.valve, sprinkler_unit.id)
        sleep(5)
                
        
if __name__ == "__main__":
  main() """
