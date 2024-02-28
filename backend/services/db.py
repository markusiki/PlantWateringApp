import json
db = 'unitsDB.json'

def getUnits():
  file = open(db)
  units = json.load(file)
  file.close()
  for unit in units:
    unit.pop("sensor")
    unit.pop("valve")
  return units

def findById(id):
  file = open(db, 'r')
  units = json.load(file)
  index = -1
  for i, unit in enumerate(units):
    if unit["id"] == id:
      index = i
  
  if index != -1:
    return index

def saveToDb(units):
  file = open(db, 'w')
  json.dump(units, file)
  file.close()


def changeUnit(unitToChange, index):
  file = open(db, 'r')
  units = json.load(file)
  unit = units[index]
  unit["name"] = unitToChange["name"]
  unit["moistLimit"] = int(unitToChange["moistLimit"])
  unit["waterTime"] = int(unitToChange["waterTime"])
  saveToDb(units)
  file = open(db, 'r')
  changedUnits = json.load(file)
  file.close()
  changedUnit = changedUnits[index]
  print(changedUnit)
  return changedUnit

#For raspi use ony

def updateMoistLevels(moistLevels):
  file = open(db, 'r')
  units = json.load(file)
  for moistLevel in moistLevels:
    for unit in units:
      if unit["id"] == moistLevel["id"]:
        
        unit["moistLevel"] = round((1 - moistLevel["value"]/20000), 2)
  saveToDb(units)


def getSprinklerUnits():
  file = open(db)
  units = json.load(file)
  for unit in units:
    unit.pop('name')
    unit.pop('status')
    unit.pop('moistLimit')
    unit.pop('logs')
  file.close()
  return units
