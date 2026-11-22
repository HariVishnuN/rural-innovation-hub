import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.db.session import engine

client = TestClient(app)

def test_cors_and_registration():
    print("=== TESTING CORS & REGISTRATION FROM FRONTEND ORIGIN ===")

    # Clean up test user if exists
    test_email = "cors_test_innovator@ruralhub.org"
    test_uname = "cors_user"
    with engine.connect() as conn:
        conn.execute(text(f"DELETE FROM users WHERE email = '{test_email}' OR username = '{test_uname}'"))
        conn.commit()

    origins_to_test = ["http://localhost:5173", "http://127.0.0.1:5173"]

    for origin in origins_to_test:
        print(f"\n--- Testing Preflight OPTIONS from Origin: {origin} ---")
        options_res = client.options(
            "/api/auth/register",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,authorization",
            },
        )
        print(f"OPTIONS Status: {options_res.status_code}")
        print(f"Allow-Origin Header: {options_res.headers.get('access-control-allow-origin')}")
        print(f"Allow-Credentials Header: {options_res.headers.get('access-control-allow-credentials')}")
        assert options_res.status_code == 200, f"Expected 200, got {options_res.status_code}"
        assert options_res.headers.get("access-control-allow-origin") == origin, f"Origin mismatch: {options_res.headers.get('access-control-allow-origin')}"
        assert options_res.headers.get("access-control-allow-credentials") == "true"
        print(f"PASS: Preflight OPTIONS for {origin} succeeded!")

    print("\n--- Testing POST /api/auth/register from Origin: http://localhost:5173 ---")
    reg_payload = {
        "full_name": "CORS Verified Innovator",
        "username": test_uname,
        "email": test_email,
        "password": "securepassword123",
        "pin": "4321",
        "role": "Innovator",
        "phone_number": "+91 99887 76655",
        "village_or_city": "Dharmaj",
        "state": "Gujarat",
        "pincode": "388430",
        "skills_or_expertise": "Precision Irrigation",
        "consent_accepted": True,
    }

    reg_res = client.post(
        "/api/auth/register",
        json=reg_payload,
        headers={"Origin": "http://localhost:5173"},
    )
    print(f"Registration Status: {reg_res.status_code}")
    print(f"Allow-Origin Header: {reg_res.headers.get('access-control-allow-origin')}")
    print(f"Response: {reg_res.json()}")
    assert reg_res.status_code == 201
    assert reg_res.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert reg_res.headers.get("access-control-allow-credentials") == "true"
    token = reg_res.json()["access_token"]
    assert token, "Token must be present in response"
    print("PASS: POST /api/auth/register succeeded from origin http://localhost:5173!")

    print("\n--- Testing POST /api/auth/pin-login from Origin: http://127.0.0.1:5173 ---")
    pin_res = client.post(
        "/api/auth/pin-login",
        json={"username": test_uname, "pin": "4321"},
        headers={"Origin": "http://127.0.0.1:5173"},
    )
    print(f"PIN Login Status: {pin_res.status_code}")
    print(f"Allow-Origin Header: {pin_res.headers.get('access-control-allow-origin')}")
    assert pin_res.status_code == 200
    assert pin_res.headers.get("access-control-allow-origin") == "http://127.0.0.1:5173"
    assert pin_res.headers.get("access-control-allow-credentials") == "true"
    print("PASS: POST /api/auth/pin-login succeeded from origin http://127.0.0.1:5173!")

    # Clean up test user
    with engine.connect() as conn:
        conn.execute(text(f"DELETE FROM users WHERE email = '{test_email}' OR username = '{test_uname}'"))
        conn.commit()

    print("\n==========================================")
    print("ALL CORS & REGISTRATION TESTS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    test_cors_and_registration()
