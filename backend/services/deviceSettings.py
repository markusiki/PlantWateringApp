import json

db = 'deviceSettings.json'

def getAll():
  file = open(db)
  settings = json.load(file)
  file.close()
  return settings

def changeSettings(body):
  settings = getAll()
  print('settings', settings)
  settings["autoWatering"] = body["autoWatering"]
  settings["moistMeasureIntervall"] = body["moistMeasureIntervall"]
  file = open(db, 'w')
  json.dump(settings, file)
  file.close()
  changedSettings = getAll()
  return changedSettings
