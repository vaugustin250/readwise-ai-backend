from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "ReadWise AI Backend API"}

def test_create_profile_unauthorized():
    response = client.post("/api/v1/profiles/", json={"name": "Test", "age": 8, "grade": "3", "language": "en"})
    assert response.status_code == 401

def test_create_profile_authorized():
    headers = {"Authorization": "Bearer mock-valid-token"}
    response = client.post("/api/v1/profiles/", json={"name": "Test", "age": 8, "grade": "3", "language": "en"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Test"
