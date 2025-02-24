from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import os
import sys
from ..services.deviceSettings import getAll, changeSettings
from ..schemas import DeviceSchema
from ..timeProgram import setTimeProgram
from ..deviceFunctions import setUnitObjects

deviceRouter = Blueprint("deviceRouter", __name__)

@deviceRouter.post("/shutdown")
@jwt_required()
def shutdown():
    try:
        os.system("sudo shutdown -h now &")
        return jsonify({"message": "System shutting down"})
    
    except Exception as error:
        return jsonify({"message": "Internal server error"}), 500
    
        
@deviceRouter.get("")
@jwt_required()
def getAllDevice():
    try:
        response = getAll()
        return response
    except Exception as error:
        return jsonify({"message": "Internal server error"}), 500


@deviceRouter.put("")
@jwt_required()
def changeDeciveSettings():
    try:
        body = request.get_json()
        DeviceSchema().load(body)
        response = changeSettings(body)
        setTimeProgram()
        setUnitObjects()
        return response, 200
    except Exception as error:
        return jsonify({"message": "Internal server error"}), 500
