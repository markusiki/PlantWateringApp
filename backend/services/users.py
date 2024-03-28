import json

db = "users.json"


def findUser(username):
    file = open(db)
    users = json.load(file)
    file.close()
    for user in users:
        if user["username"] == username:
            return user
    return None
