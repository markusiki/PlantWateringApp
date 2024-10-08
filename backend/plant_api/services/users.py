from flask import current_app
import json

path = ""


def setUsersDB(app):
    global path
    with app.app_context():
        path = current_app.config["USERS_DB"]


def findUser(username):
    file = open(path)
    users = json.load(file)
    file.close()
    for user in users:
        if user["username"] == username:
            return user
    return None
