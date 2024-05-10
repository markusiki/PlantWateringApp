from flask import jsonify, request, Blueprint
from services import users
from app import bcrypt
from flask_jwt_extended import create_access_token, set_access_cookies

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

        acces_token = create_access_token(identity=username)
        response = jsonify(username=username)
        set_access_cookies(response, acces_token)
        return response
    except Exception as error:
        print(error)

        return 500
