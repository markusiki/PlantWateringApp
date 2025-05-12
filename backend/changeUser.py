#Change user for the app and saves the changed user to the users.json database.

import subprocess
from flask_bcrypt import generate_password_hash
import os
from pwinput import pwinput
import requests
from dotenv import load_dotenv
from plant_api.services.dbHelper import openDB, dumpDB

load_dotenv()

path = os.path.join(os.path.dirname(__file__), "plant_api/databases/users.json")

def get_and_check_username(users):
    while True:
        username = input("Enter new username: ")
        for user in users:
            if user["username"] == username:
                print("Username already exists.")
                break
        else:
            return username
            
def get_and_check_password():
    while True:
        password = pwinput("Enter new password: ")
        password_confirm = pwinput("Enter new password again: ")
        if password != password_confirm:
            print("Passwords do not match. Try again.")
        else:
            return password          
        

users = openDB(path)
username = get_and_check_username(users)
password = get_and_check_password()
pwhash = generate_password_hash(password, 10).decode("utf-8")
user = {"username": username, "passwordHash": pwhash}
serial = subprocess.check_output("cat /opt/dataplicity/tuxtunnel/serial", shell=True).decode()
request_body = {
    "oldUsername": users[0]["username"],
    "newUsername": username,
    "pwhash": pwhash,
    "serial": serial,
}
response = requests.post(f'{os.getenv("API_GATEWAY_URI")}/change-user', json=request_body )
if response.ok:
    users[0] = user
    dumpDB(path, users)
    
print(response.json()) 

