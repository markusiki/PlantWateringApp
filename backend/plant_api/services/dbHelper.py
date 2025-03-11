import json
from ..databases.models import device, units

def createFile(path):
    if path.endswith('unitsDB.json'):
        dumpDB(path, units.units_model)
    elif path.endswith('deviceSettings.json'):
        dumpDB(path, device.device_model)
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