import pytest

from .conftest import path_to_unitsDB
from .test_helpers.db import get_from_db
from time import sleep


def test_time_program(app):
    units = get_from_db(path_to_unitsDB)
    for unit in units:
        assert unit["logs"] == []
    with app.app_context():
        from plant_api.timeProgram import setTimeProgram

        setTimeProgram()

    sleep(8)
    units = get_from_db(path_to_unitsDB)
    for unit in units:
        assert unit["logs"] != []
