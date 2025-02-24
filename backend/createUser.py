# Create user for the app and saves the created user to the users.json database.
# If database does not exist, it will be creted and initialised

from flask_bcrypt import generate_password_hash
import os
import json
from getpass import getpass

db = os.path.join(os.path.dirname(__file__), "plant_api/databases/users.json")


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
            while True:
                password = getpass("Enter password: ")
                password_confirm = getpass("Enter password again: ")
                if password != password_confirm:
                    print("Passwords do not match. Try again.")
                else:
                    break
            hash = generate_password_hash(password, 10).decode("utf-8")
            user = {"username": username, "passwordHash": hash}
            users.append(user)
            file.seek(0)
            json.dump(users, file, indent=3)
            file.close()  
            backup = open(f"{db[:-4]}back.json", "w")
            json.dump(users, backup, indent=3)
            backup.close()
            break

    except FileNotFoundError:
        file = open(db, "w")
        json.dump([], file)
        file.close()