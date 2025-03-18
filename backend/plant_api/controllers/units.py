from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required
from ..services.unitsDB import (
    updateMoistValuesToDB,
    getUnits,
    findById,
    modifyUnitToDB,
    updateLog,
    deleteLog,
    getById,
    clearWaterCounter
)
from ..services.deviceSettings import getData
from ..deviceFunctions import updateMoistValues, updateSprinklerUnitObject, measureSoil, waterNow
from ..schemas import UnitsSchema

unitsRouter = Blueprint("unitsRouter", __name__)


@unitsRouter.get("")
@jwt_required()
def getAll():
    try:
        moistValues = updateMoistValues()
        updateMoistValuesToDB(moistValues)
        response = getUnits(innerUse=False)
        return response
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


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
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


@unitsRouter.post("/<string:unitId>")
@jwt_required()
def waterUnit(unitId):
    try:
        moistValue = measureSoil(unitId)
        status = waterNow(unitId)
        updateLog(**moistValue, watered=status["isWatered"], waterMethod="manual", message=status["message"])
        unit = getById(unitId, innerUse=False)
        waterAmount = getData("waterAmount")
        return jsonify({ "unit": unit, "waterAmount": waterAmount })
    except Exception as error:
        print(error)
        return jsonify({"message": "Internal server error"}), 500


@unitsRouter.delete("/logs/<string:unitId>")
@jwt_required()
def deleteLogs(unitId):
    try:
        deleteLog(unitId)
        unit = getById(unitId, innerUse=False)
        return unit
    except Exception:
        return jsonify({"message": "Internal server error"}), 500
    
@unitsRouter.put("/counter/<string:unitId>")
@jwt_required()
def clearCounters(unitId):
    try:
        clearWaterCounter(unitId)
        unit = getById(unitId, innerUse=False)
        return unit
    except Exception:
        return jsonify({"message": "Internal server error"}), 500 
