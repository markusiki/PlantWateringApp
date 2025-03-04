# Create user for the app and saves the created user to the users.json database.
# If database does not exist, it will be creted and initialised

import subprocess
from flask_bcrypt import generate_password_hash
import os
import json
from pwinput import pwinput
import requests
from dotenv import load_dotenv
from plant_api.services.dbHelper import openDB, dumpDB
import json

load_dotenv()

path = os.path.join(os.path.dirname(__file__), "plant_api/databases/users.json")

def get_and_check_username(users):
    while True:
        username = input("Enter username: ")
        for user in users:
            if user["username"] == username:
                print("Username already exists.")
                break
        else:
            return username
            
def get_and_check_password():
    while True:
        password = pwinput("Enter password: ")
        password_confirm = pwinput("Enter password again: ")
        if password != password_confirm:
            print("Passwords do not match. Try again.")
        else:
            return password          
        

users = openDB(path)
username = get_and_check_username(users)
password = get_and_check_password()
hash = generate_password_hash(password, 10).decode("utf-8")
user = {"username": username, "passwordHash": hash}
serial = subprocess.check_output("cat /opt/dataplicity/tuxtunnel/serial", shell=True).decode()
procinfo = subprocess.check_output("cat /proc/cpuinfo | grep Serial", shell=True).decode()
rpi_serial = procinfo.split()[-1]
request_body = {
    "username": username,
    "pwhash": hash,
    "serial": serial,
    "rpi_serial": rpi_serial
}
response = requests.post(os.getenv("API_GATEWAY_URI"), json=request_body )
if response.ok:
    users.append(user)
    dumpDB(path, users)
    
print(response.json()) 

