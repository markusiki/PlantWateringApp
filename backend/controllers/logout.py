from flask import jsonify, Blueprint

from flask_jwt_extended import unset_jwt_cookies

logoutRouter = Blueprint("logoutRouter", __name__)


@logoutRouter.post("")
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response
