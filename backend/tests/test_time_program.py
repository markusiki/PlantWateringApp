import pytest
from .conftest import path_to_unitsDB, path_to_deviceDB
from .test_helpers.db import (
    get_all_units,
    save_to_units_db,
    get_device_settings,
    save_to_device_db,
    save_log_to_units_db,
)
from time import sleep
from .test_helpers.create_db import create_test_units_db, create_test_device_db
from datetime import datetime
from threading import Timer


@pytest.fixture(scope="function", autouse=True)
def run_around_tests(app, set_time_program):
    # Before each test
    create_test_units_db(path_to_unitsDB)
    create_test_device_db(path_to_deviceDB)
    yield
    # After each test
    device_settings = get_device_settings(app)
    device_settings["runTimeProgram"] = False
    save_to_device_db(app, device_settings)
    set_time_program()


def last_time_measured(unit):
    first_measure = datetime.strptime(unit["logs"][1]["date"], "%d.%m.%Y %H:%M:%S")
    last_measure = datetime.strptime(unit["logs"][0]["date"], "%d.%m.%Y %H:%M:%S")

    return abs((last_measure - first_measure).seconds)


def test_auto_watering_min_watering_interval(app, set_time_program):
    units = get_all_units(app)
    for unit in units:
        unit["enableAutoWatering"] = True
        unit["enableMinWaterInterval"] = True
        unit["minWaterInterval"] = 1
    save_to_units_db(app, units)

    device_settings = get_device_settings(app)
    device_settings["runTimeProgram"] = True
    device_settings["moistMeasureInterval"] = 3
    save_to_device_db(app, device_settings)

    for unit in units:
        assert unit["logs"] == []

    set_time_program()

    sleep(6)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 1
        assert unit["logs"][0]["waterMethod"] == "auto"
        assert unit["logs"][0]["message"] == "minimum watering interval"
    # Change unit settings to prevent watering for Unit1

    units[0]["enableMinWaterInterval"] = False
    units[0]["minWaterInterval"] = 1
    save_to_units_db(app, units)

    sleep(6)
    units = get_all_units(app)
    for unit_index, unit in enumerate(units):
        assert len(unit["logs"]) > 1
        if unit_index == 0:
            for index, log in enumerate(reversed(unit["logs"])):
                assert log["watered"] == True if index == 0 else log["watered"] == False
        else:
            for log in unit["logs"]:
                assert log["watered"] == True


def test_auto_watering_moist_level(app, set_time_program):
    units = get_all_units(app)
    for unit in units:
        unit["enableAutoWatering"] = True
        unit["enableMinWaterInterval"] = False
        #Set Unit1 and Unit2 moist level scale inversed and Unit3 and Unit4 not inversed
        if unit["id"] == "Unit1" or unit["id"] == "unit2":
            unit["dryMoistValue"] = 20000
            unit["wetMoistValue"] = 10000
            unit["moistValue"] = 15000
            unit["moistLimit"] = 14000
        else:
            unit["dryMoistValue"] = 15000
            unit["wetMoistValue"] = 30000
            unit["moistValue"] = 20000
            unit["moistLimit"] = 21000
            

    save_to_units_db(app, units)

    device_settings = get_device_settings(app)
    device_settings["runTimeProgram"] = True
    device_settings["moistMeasureInterval"] = 10
    save_to_device_db(app, device_settings)

    set_time_program()

    sleep(6)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 1
        assert unit["logs"][0]["waterMethod"] == "auto"
        assert unit["logs"][0]["message"] == "moist level"
    # Change unit settings to prevent watering of two units
    units[0]["enableMaxWaterInterval"] = True
    units[0]["maxWaterInterval"] = 100
    units[2]["status"] = "ERROR"
    save_to_units_db(app, units)

    sleep(14)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 2
    assert units[0]["logs"][0]["watered"] == False
    assert units[1]["logs"][0]["watered"] == True
    assert units[1]["logs"][0]["waterMethod"] == "auto"
    assert units[1]["logs"][0]["message"] == "moist level"
    assert units[2]["logs"][0]["watered"] == False
    assert units[2]["logs"][0]["message"] == "Unit in error, not watered."
    assert units[3]["logs"][0]["watered"] == True
    assert units[3]["logs"][0]["waterMethod"] == "auto"
    assert units[3]["logs"][0]["message"] == "moist level"


def test_auto_watering_does_not_water(app, set_time_program):
    units = get_all_units(app)
    for unit in units:
        unit["moistLimit"] = 19000
        unit["enableMinWaterInterval"] = False
    save_to_units_db(app, units)

    device_settings = get_device_settings(app)
    device_settings["runTimeProgram"] = True
    device_settings["moistMeasureInterval"] = 5
    save_to_device_db(app, device_settings)

    set_time_program()

    sleep(4)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 1
        assert unit["logs"][0]["watered"] == False

    sleep(5)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 2
        assert unit["logs"][0]["watered"] == False


def test_time_program_does_not_water_if_auto_watering_not_enabled(app, set_time_program):
    units = get_all_units(app)
    for unit in units:
        unit["enableAutoWatering"] = False
        unit["enableMaxWaterInterval"] = True
        unit["enableMinWaterInterval"] = True

    save_to_units_db(app, units)

    device_settings = get_device_settings(app)
    device_settings["runTimeProgram"] = True
    device_settings["moistMeasureInterval"] = 5
    save_to_device_db(app, device_settings)

    set_time_program()

    sleep(4)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 1
        assert unit["logs"][0]["watered"] == False

    sleep(5)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 2
        assert unit["logs"][0]["watered"] == False


def test_time_program_only_waters_number_of_units_defined_by_numberOfUnits(app, set_time_program):
    units = get_all_units(app)
    for unit in units:
        unit["enableAutoWatering"] = True
        unit["moistLimit"] = 14000
        unit["enableMinWaterInterval"] = False
    save_to_units_db(app, units)

    device_settings = get_device_settings(app)
    device_settings["runTimeProgram"] = True
    device_settings["moistMeasureInterval"] = 5
    device_settings["numberOfUnits"] = 2
    save_to_device_db(app, device_settings)

    set_time_program()

    sleep(5)
    units = get_all_units(app)
    assert len(units[0]["logs"]) == 1
    assert len(units[1]["logs"]) == 1
    assert len(units[2]["logs"]) == 0
    assert len(units[3]["logs"]) == 0

    device_settings["numberOfUnits"] = 3
    save_to_device_db(app, device_settings)

    sleep(5)
    units = get_all_units(app)
    assert len(units[0]["logs"]) == 2
    assert len(units[1]["logs"]) == 2
    assert len(units[2]["logs"]) == 1
    assert len(units[3]["logs"]) == 0


def test_moist_measure_interval_can_be_changed_while_timeprogram_is_running(app, set_time_program):
    # Tests timer function
    units = get_all_units(app)
    for unit in units:
        unit["moistLimit"] = 19000
        unit["moistLevel"] = 15000
        unit["enableMinWaterInterval"] = False
    save_to_units_db(app, units)

    device_settings = get_device_settings(app)
    device_settings["runTimeProgram"] = True
    device_settings["moistMeasureInterval"] = 3
    save_to_device_db(app, device_settings)

    set_time_program()

    sleep(2)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 1
        assert unit["logs"][0]["watered"] == False

    device_settings["moistMeasureInterval"] = 5
    save_to_device_db(app, device_settings)
    set_time_program()

    sleep(8)
    units = get_all_units(app)
    for unit in units:
        assert len(unit["logs"]) == 2
        assert unit["logs"][0]["watered"] == False


def test_last_time_watered_function(app):
    with app.app_context():
        from plant_api.timeProgram import lastTimeWatered

    units = get_all_units(app)
    for unit in units:
        unit["logs"] = [
            {
                "date": datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
                "id": unit["id"],
                "status": unit["status"],
                "moistValue": unit["moistValue"],
                "watered": True,
                "waterMethod": "auto",
                "message": "minimum watering interval",
            }
        ]

    sleep(2)
    for unit in units:
        assert lastTimeWatered(unit) == 2


def test_auto_watering_does_not_water_if_the_same_unit_is_being_watered_manually(
    app, client, auth, set_time_program
):
    units = get_all_units(app)
    units[0]["waterTime"] = 5

    save_to_units_db(app, units)

    device_settings = get_device_settings(app)
    device_settings["runTimeProgram"] = True
    device_settings["moistMeasureInterval"] = 10
    save_to_device_db(app, device_settings)
    
    timer = Timer(2, set_time_program)
    timer.start()

    auth.login()
    #response_put = client.put("/api/units", json=unit, headers=auth.get_headers())
    #print("put_response: ", response_put.get_json())
    reponse_post = client.post("/api/units/Unit1", headers=auth.get_headers())
    print("post_response: ", reponse_post.get_json())


    sleep(6)

    units = get_all_units(app)
    for unit in units:
        if unit["id"] == "Unit1":
            assert unit["logs"][1]["watered"] == False
            assert unit["logs"][1]["message"] == "Manual waterign of Unit1 in process."
        else:
            assert unit["logs"][0]["watered"] == True
            print(unit["logs"][0]["message"])
            assert unit["logs"][0]["message"] == "minimum watering interval"
