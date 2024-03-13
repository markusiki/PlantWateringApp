from flask import Flask, request, make_response
import services.deviceSettings as deviceSettings
import services.db as dbService
import deviceFunctions as raspi
from timeProgram import setTimeProgram
from schemas import UnitsSchema, DeviceSchema
import json
from marshmallow import ValidationError

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")

deviceRoute: str = "/api/device"
unitsRoute: str = "/api/units"


@app.route("/")
def index():
    return app.send_static_file("index.html")


# Device settings APIs
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
        DeviceSchema().load(body)
        response = deviceSettings.changeSettings(body)
        setTimeProgram()
        print("response:", response)
        return response
    except Exception as error:
        print("error", error)
        return 503


# Unit settings APIs
@app.get(unitsRoute)
def getAll():
    try:
        moistValues = raspi.updateMoistValues()
        dbService.updateMoistValues(moistValues)
        response = dbService.getUnits()
        return response
    except Exception as error:
        print(error)
        return 503


@app.put(unitsRoute)
def changeUnit():
    try:
        body = request.get_json()
        UnitsSchema().load(body)
        index = dbService.findById(body["id"])
        response = dbService.changeUnit(body, index)
        raspi.updateSprinklerUnitObject(body["id"], index)
        return response
    except ValidationError as error:
        print(error)
        return "Error", 500


@app.post(f"{unitsRoute}/<string:unitId>")
def waterNow(unitId):
    raspi.waterNow(unitId)
    index = dbService.findById(unitId)
    units = dbService.getUnits()
    unit = units[index]
    return unit


@app.delete(f"{unitsRoute}/logs/<string:unitId>")
def deleteLogs(unitId):
    dbService.deleteLog(unitId)
    unit = dbService.getById(unitId)
    return unit
