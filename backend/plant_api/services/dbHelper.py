from ctypes import Array
import json
from ..databases.models import device, units


def getModel(path):
    if path.endswith("unitsDB.json"):
        return units.units_model
    elif path.endswith("deviceSettings.json"):
        return device.device_model
    else:
        return []


def createFile(path):
    model = getModel(path)
    dumpDB(path, model)
    file = open(path, "r")
    content = json.load(file)
    file.close()

    return content


def openDB(path: str):
    try:
        file = open(path, "r")
        content = json.load(file)
        file.close()
    except Exception:
        try:
            file = open(f"{path[:-4]}back.json", "r")
            content = json.load(file)
            file.close()
            dumpDB(path, content)
        except Exception:
            content = createFile(path)

    return content


def dumpDB(path, content):
    file = open(path, "w")
    json.dump(content, file)
    file.close()
    backup = open(f"{path[:-4]}back.json", "w")
    json.dump(content, backup)
    backup.close()


# Check DB against model, add missing keys with default values
def checkAndUpdateDB(path):
    model = getModel(path)
    db = openDB(path)

    if isinstance(model, list):
        for db_item in db:
            for key in model[0].keys():
                if key not in db_item:
                    db_item[key] = model[0][key]

        dumpDB(path, db)
    elif isinstance(model, dict):
        for key in model.keys():
            if key not in db:
                db[key] = model[key]

        dumpDB(path, db)
