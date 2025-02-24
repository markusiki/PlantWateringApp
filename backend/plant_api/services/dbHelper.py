import json

def openDB(path):
    try:
        file = open(path, "r")
        content = json.load(file)
    except Exception:
        file = open(f"{path[:-4]}back.json", "r")
        content = json.load(file)
    finally:
        file.close()
      
    return content

def dumpDB(path, content):
    file = open(path, "w")
    json.dump(content, file)
    file.close()
    backup = open(f"{path[:-4]}back.json", "w")
    json.dump(content, backup)
    backup.close()