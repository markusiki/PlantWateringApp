import os
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
db = "../users.json"
path = os.path.join(base_dir, db)


def findUser(username):
    file = open(path)
    users = json.load(file)
    file.close()
    for user in users:
        if user["username"] == username:
            return user
    return None
