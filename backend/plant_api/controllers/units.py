from flask import jsonify, request, Blueprint
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
        print(error)
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
    except Exception as error:
        print(error)
        return jsonify({"message": "Internal server error"}), 500


@unitsRouter.post("/<string:unitId>")
@jwt_required()
def waterUnit(unitId):
    try:
        moistValue = measureSoil(unitId)
        waterNow(unitId)
        updateLog(**moistValue, watered=True, waterMethod="manual")
        unit = getById(unitId, innerUse=False)
        return unit
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
    except Exception as error:
        print(error)
        return jsonify({"message": "Internal server error"}), 500
