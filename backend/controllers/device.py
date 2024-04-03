from flask import Blueprint, request
from flask_jwt_extended import jwt_required
import services.deviceSettings as deviceSettings
from schemas import DeviceSchema
from timeProgram import setTimeProgram

deviceRouter = Blueprint("deviceRouter", __name__)


@deviceRouter.get("")
@jwt_required()
def getAllDevice():
    try:
        response = deviceSettings.getAll()
        return response
    except Exception as error:
        print(error)
        return 503


@deviceRouter.put("")
@jwt_required()
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
