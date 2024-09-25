from flask import jsonify, Blueprint

from flask_jwt_extended import unset_jwt_cookies

logoutRouter = Blueprint("logoutRouter", __name__)


@logoutRouter.post("")
def logout():
    try:
        response = jsonify({"message": "logout successful"})
        unset_jwt_cookies(response)
        return response
    except Exception:
        return jsonify({"message": "Internal server error"}), 500
