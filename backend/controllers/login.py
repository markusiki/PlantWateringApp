from flask import jsonify, request, Blueprint
from services import users
from marshmallow import ValidationError
from app import bcrypt
from flask_jwt_extended import create_access_token

loginRouter = Blueprint("loginRouter", __name__)


@loginRouter.post("")
def login():
    try:
        username = request.json.get("username", None)
        password = request.json.get("password", None)
        user = users.findUser(username)
        passwordCorrect = (
            False if user == None else bcrypt.check_password_hash(user["passwordHash"], password)
        )

        if user is None or passwordCorrect is False:
            return jsonify({"message": "Invalid username or password"}), 401

        token = create_access_token(identity=username)
        return jsonify(token=token)
    except Exception as error:
        print(error)
        return 500
