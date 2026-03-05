import json


def create_db(path, model):
    file = open(path, "w")
    json.dump(model, file)
    file.close()
