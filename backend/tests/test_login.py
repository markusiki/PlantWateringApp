import pytest

user = {"username": "test", "password": "test"}


def test_login(client):
    response = client.post("/api/login", json=user)
    assert response.status_code == 200
