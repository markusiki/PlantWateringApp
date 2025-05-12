#Change user for the app and saves the changed user to the users.json database.

from plant_api.services.users import findUser
import sys
import subprocess
from flask_bcrypt import generate_password_hash, check_password_hash
import os
from pwinput import pwinput
import requests
from dotenv import load_dotenv
from plant_api.services.dbHelper import openDB, dumpDB

load_dotenv()

path = os.path.join(os.path.dirname(__file__), "plant_api/databases/users.json")

def get_user(users, username):
    for user in users:
        if user["username"] == username:
            return user
          
def verify_user(users):
    username = input("Enter old username: ")
    password = pwinput("Enter old password: ")
    user = get_user(users, username)
    passwordCorrect = (
              False if user == None else check_password_hash(user["passwordHash"], password)
          )
    if user is None or passwordCorrect is False:
        return False
    
    user = {"username": username, "password": password}
    return user
          

def get_and_check_username(users):
    while True:
        username = input("Enter new username or leave blank to not change: ")
        if username == "": 
            return users[0]["username"]
        
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
old_user = verify_user(users)
if not old_user:
    print("Invalid username or password")
    sys.exit()
new_username = get_and_check_username(users)
password = get_and_check_password()
pwhash = generate_password_hash(password, 10).decode("utf-8")
user = {"username": new_username, "passwordHash": pwhash}
serial = subprocess.check_output("cat /opt/dataplicity/tuxtunnel/serial", shell=True).decode()
request_body = {
    "oldUsername": old_user["username"],
    "oldPassword": old_user["password"],
    "newUsername": new_username,
    "pwhash": pwhash,
    "serial": serial,
}
response = requests.post(f'{os.getenv("API_GATEWAY_URI")}/change-user', json=request_body )
if response.ok:
    users[0] = user
    dumpDB(path, users)
    
print(response.json()) 

