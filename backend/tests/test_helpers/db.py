import json


def get_from_db(path):
    file = open(path, "r")
    units = json.load(file)
    file.close()
    return units
