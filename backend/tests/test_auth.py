import pytest

user = {"username": "test", "password": "test"}


def test_login(client, auth):
    response = auth.login()
    assert client.get_cookie(key="csrf_access_token") is not None
    assert response.status_code == 200


def test_logout(client, auth):
    assert client.get_cookie(key="csrf_access_token") is not None
    response = auth.logout()
    assert response.status_code == 200
    assert client.get_cookie(key="csrf_access_token") is None


def test_invalid_login(client, auth):
    response = auth.login(username="test", password="invalid")
    response_data = response.get_json()
    assert client.get_cookie(key="csrf_access_token") is None
    assert response.status_code == 401
    assert response_data["message"] == "Invalid username or password"
