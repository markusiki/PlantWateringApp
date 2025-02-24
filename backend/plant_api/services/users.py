from flask import current_app
from .dbHelper import openDB

path = ""


def setUsersDB(app):
    global path
    with app.app_context():
        path = current_app.config["USERS_DB"]


def findUser(username):
    users = openDB(path)
    for user in users:
        if user["username"] == username:
            return user
    return None
