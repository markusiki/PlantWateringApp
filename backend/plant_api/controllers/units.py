from flask import request, Blueprint
from flask_jwt_extended import jwt_required
from ..services.db import (
    updateMoistValuesToDB,
    getUnits,
    findById,
    modifyUnitToDB,
    updateLog,
    deleteLog,
    getById,
)
from ..deviceFunctions import updateMoistValues, updateSprinklerUnitObject, measureSoil, waterNow
from ..schemas import UnitsSchema
from marshmallow import ValidationError

unitsRouter = Blueprint("unitsRouter", __name__)


@unitsRouter.get("")
@jwt_required()
def getAll():
    try:
        moistValues = updateMoistValues()
        updateMoistValuesToDB(moistValues)
        response = getUnits(innerUse=False)
        return response
    except Exception as error:
        return 503


@unitsRouter.put("")
@jwt_required()
def changeUnit():
    try:
        body = request.get_json()
        UnitsSchema().load(body)
        index = findById(body["id"])
        response = modifyUnitToDB(body, index)
        updateSprinklerUnitObject(body["id"], index)
        return response
    except ValidationError as error:
        return "Error", 500


@unitsRouter.post("/<string:unitId>")
@jwt_required()
def waterUnit(unitId):
    moistValue = measureSoil(unitId)
    waterNow(unitId)
    updateLog(**moistValue, watered=True, waterMethod="manual")
    index = findById(unitId)
    units = getUnits()
    unit = units[index]
    return unit


@unitsRouter.delete("/logs/<string:unitId>")
@jwt_required()
def deleteLogs(unitId):
    deleteLog(unitId)
    unit = getById(unitId)
    return unit
