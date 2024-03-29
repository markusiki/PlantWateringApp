from flask import request, Blueprint
from flask_jwt_extended import jwt_required
import services.db as dbService
import deviceFunctions as raspi
from schemas import UnitsSchema
from marshmallow import ValidationError

unitsRouter = Blueprint("unitsRouter", __name__)


@unitsRouter.get("")
def getAll():
    try:
        moistValues = raspi.updateMoistValues()
        dbService.updateMoistValues(moistValues)
        response = dbService.getUnits(innerUse=False)
        return response
    except Exception as error:
        print(error)
        return 503


@unitsRouter.put("")
@jwt_required()
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


@unitsRouter.post("/<string:unitId>")
@jwt_required()
def waterNow(unitId):
    moistValue = raspi.waterNow(unitId)
    dbService.updateLog(**moistValue, watered=True, waterMethod="manual")
    index = dbService.findById(unitId)
    units = dbService.getUnits()
    unit = units[index]
    return unit


@unitsRouter.delete("/logs/<string:unitId>")
@jwt_required()
def deleteLogs(unitId):
    dbService.deleteLog(unitId)
    unit = dbService.getById(unitId)
    return unit
