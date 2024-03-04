from flask import Flask, request, make_response
import json
import services.deviceSettings as deviceSettings
import services.db as dbService
import deviceFunctions as raspi
from timeProgram import setTimeProgram
import threading


app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

deviceRoute: str = '/api/device'
unitsRoute: str = '/api/units'

@app.route('/')
def index():
  return app.send_static_file('index.html')

#Device settings APIs
@app.get(deviceRoute)
def getAllDevice():
  try:
    response = deviceSettings.getAll()
    return response
  except Exception as error:
    print(error)
    return 503

@app.put(deviceRoute)
def changeDeciveSettings():
  try:
    body = request.get_json()
    print(body)
    response = deviceSettings.changeSettings(body)
    setTimeProgram()
    print('response:', response)
    return response
  except Exception as error:
    print('error', error)
    return 503


#Unit settings APIs
@app.get(unitsRoute)
def getAll():
  try:
    moistLevels = raspi.updateMoistLevels()
    dbService.updateMoistLevels(moistLevels)
    response = dbService.getUnits()
    return response
  except Exception as error:
    print(error)
    return 503


@app.put(f'{unitsRoute}/<string:unit_id>')
def changeUnit(unit_id):
  try:
    body = request.get_json()
    index = dbService.findById(unit_id)
    response = dbService.changeUnit(body, index)
    raspi.updateSprinklerUnitObject(unit_id, index)
    return response
  except Exception as error:
    print(error)
    return 'Error', 500

@app.post(f'{unitsRoute}/<string:unit_id>')
def waterNow(unit_id):
  result = raspi.waterNow(unit_id)
  if result["message"]:
    return result

