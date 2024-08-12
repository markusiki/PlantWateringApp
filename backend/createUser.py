# Create user for the app and saves the created user to the users.json database.
# If database does not exist, it will be creted and initialised

from flask_bcrypt import generate_password_hash
import json
from getpass import getpass

db = "./datadases/users.json"


while True:
    try:
        file = open(db, "r+")
        users = json.load(file)
        username = input("Enter username: ")
        for user in users:
            if user["username"] == username:
                print("Username already exists.")
                break
        else:
            password = getpass("Enter password: ")
            hash = generate_password_hash(password, 10).decode("utf-8")
            user = {"username": username, "passwordHash": hash}
            users.append(user)
            file.seek(0)
            json.dump(users, file, indent=3)
            file.close()
            break

    except FileNotFoundError:
        file = open(db, "w")
        json.dump([], file)
        file.close()
