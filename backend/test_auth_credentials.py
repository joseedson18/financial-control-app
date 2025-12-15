import sys
from fastapi.testclient import TestClient

sys.path.append('.')
sys.path.append('backend')

from backend.auth import USERS_DB, verify_password  # noqa: E402
from backend.main import app  # noqa: E402


def test_password_hashes_accept_known_passwords():
    assert verify_password("fxdxudu18!", USERS_DB["josemercadogc18@gmail.com"]["password_hash"])
    assert verify_password("123456", USERS_DB["matheuscastrocorrea@gmail.com"]["password_hash"])
    assert verify_password("654321!", USERS_DB["jc@juicyscore.ai"]["password_hash"])


def test_login_endpoint_accepts_known_user():
    client = TestClient(app)
    response = client.post(
        "/api/login",
        data={"username": "josemercadogc18@gmail.com", "password": "fxdxudu18!"},
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert "access_token" in payload and payload.get("token_type") == "bearer"


def test_login_endpoint_accepts_matheus_user():
    client = TestClient(app)
    response = client.post(
        "/api/login",
        data={"username": "matheuscastrocorrea@gmail.com", "password": "123456"},
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert "access_token" in payload and payload.get("token_type") == "bearer"


def test_login_endpoint_trims_and_lowercases_email():
    """Avoid regressions where whitespace/casing prevent authentication."""
    client = TestClient(app)
    # Leading/trailing spaces
    response_spaces = client.post(
        "/api/login",
        data={"username": "  MatheusCastroCorrea@gmail.com  ", "password": "123456"},
    )
    assert response_spaces.status_code == 200, response_spaces.text

    # Mixed casing
    response_case = client.post(
        "/api/login",
        data={"username": "MATHEUSCASTROCORREA@GMAIL.COM", "password": "123456"},
    )
    assert response_case.status_code == 200, response_case.text


