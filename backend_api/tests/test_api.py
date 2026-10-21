import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "ReadWise AI Backend API"}

def test_mock_token_is_rejected():
    """Verify that legacy mock tokens are strictly rejected (Acceptance Criteria 1)."""
    headers = {"Authorization": "Bearer mock-valid-token"}
    response = client.post(
        "/api/v1/profiles/",
        json={"name": "Test Child", "age": 8, "grade": "3", "language": "en"},
        headers=headers
    )
    assert response.status_code == 401

def test_unauthenticated_request_rejected():
    response = client.post(
        "/api/v1/profiles/",
        json={"name": "Test Child", "age": 8, "grade": "3", "language": "en"}
    )
    assert response.status_code == 401

def test_auth_registration_and_login_flow():
    """Verify user registration, login, and JWT token issuance."""
    test_email = "guardian_test@example.com"
    test_password = "SecurePassword123!"

    # 1. Register new user
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": test_email, "password": test_password, "role": "parent"}
    )
    # Status can be 201 or 400 if user exists from previous test run
    if reg_response.status_code == 400:
        assert "already exists" in reg_response.json()["detail"]
    else:
        assert reg_response.status_code == 201
        data = reg_response.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_email

    # 2. Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password}
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # 3. Access protected /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == test_email

    # 4. Create child profile with valid JWT
    profile_response = client.post(
        "/api/v1/profiles/",
        json={"name": "Aarav", "age": 9, "grade": "Grade 4", "language": "English"},
        headers=headers
    )
    assert profile_response.status_code == 201
    created_profile = profile_response.json()
    assert created_profile["name"] == "Aarav"
    assert "id" in created_profile

def test_cross_guardian_idor_protection():
    """Verify cross-child data retrieval returns HTTP 403 (Acceptance Criteria 2)."""
    # Create Guardian A
    email_a = "guardian_a@example.com"
    client.post("/api/v1/auth/register", json={"email": email_a, "password": "PasswordA123!"})
    login_a = client.post("/api/v1/auth/login", json={"email": email_a, "password": "PasswordA123!"}).json()
    token_a = login_a["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Guardian A creates child
    child_a = client.post(
        "/api/v1/profiles/",
        json={"name": "Child A", "age": 7, "grade": "Grade 2", "language": "English"},
        headers=headers_a
    ).json()
    child_a_id = child_a["id"]

    # Create Guardian B
    email_b = "guardian_b@example.com"
    client.post("/api/v1/auth/register", json={"email": email_b, "password": "PasswordB123!"})
    login_b = client.post("/api/v1/auth/login", json={"email": email_b, "password": "PasswordB123!"}).json()
    token_b = login_b["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Guardian B attempts to access Guardian A's child profile
    idor_response = client.get(f"/api/v1/profiles/{child_a_id}", headers=headers_b)
    assert idor_response.status_code == 403
    assert "forbidden" in idor_response.json()["detail"].lower()

    # Guardian B attempts to screen Guardian A's child
    idor_screen_response = client.post(
        "/api/v1/assessments/screen",
        json={"child_id": child_a_id, "task_type": "T4_Meaningful_Text"},
        headers=headers_b
    )
    assert idor_screen_response.status_code == 403

    # Guardian B attempts to download report of Guardian A's child
    idor_report_response = client.get(
        f"/api/v1/assessments/report/{child_a_id}",
        headers=headers_b
    )
    assert idor_report_response.status_code == 403
