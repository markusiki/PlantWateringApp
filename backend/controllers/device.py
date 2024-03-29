from flask import Blueprint, request
import services.deviceSettings as deviceSettings
from schemas import DeviceSchema
from timeProgram import setTimeProgram

deviceRouter = Blueprint("deviceRouter", __name__)


@deviceRouter.get("")
def getAllDevice():
    try:
        response = deviceSettings.getAll()
        return response
    except Exception as error:
        print(error)
        return 503


@deviceRouter.put("")
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
