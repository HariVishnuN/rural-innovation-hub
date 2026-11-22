import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.db.session import engine, SessionLocal
from app.models.user import User

client = TestClient(app)

def run_tests():
    print("=== STARTING REGISTRATION & AUTH FIX VERIFICATION ===")

    # Step 1: Clean up previous user 7 / existing nharivishnu user to allow fresh registration
    with engine.connect() as conn:
        # Check if invention 9 exists and belongs to user with email nharivishnu31072008@gmail.com
        user = conn.execute(text("SELECT id FROM users WHERE email = 'nharivishnu31072008@gmail.com' OR username = 'hxri_vxnu'")).first()
        if user:
            old_uid = user[0]
            print(f"Temporarily detaching invention 9 from user {old_uid} to user 1...")
            conn.execute(text(f"UPDATE inventions SET creator_id = 1 WHERE creator_id = {old_uid}"))
            conn.execute(text(f"DELETE FROM users WHERE id = {old_uid}"))
            conn.commit()
            print("Cleaned up old user record.")

    # Step 2: Register with the exact payload reported by the user
    payload = {
        "full_name": "HARI VISHNU N",
        "username": "hxri_vxnu",
        "email": "nharivishnu31072008@gmail.com",
        "password": "310708",
        "pin": "3178",
        "role": "Innovator",
        "phone_number": "+91 98765 43210",
        "village_or_city": "Anand",
        "state": "Tamil Nadu",
        "pincode": "600001",
        "skills_or_expertise": "Arc Welding, Solar PV",
        "consent_accepted": True
    }

    print("\n--- TEST 1: Register New User with Field Aliases ---")
    reg_res = client.post("/api/auth/register", json=payload)
    print(f"Status: {reg_res.status_code}")
    print(f"Response: {reg_res.json()}")
    assert reg_res.status_code == 201, f"Expected 201, got {reg_res.status_code}: {reg_res.text}"
    user_data = reg_res.json()["user"]
    new_user_id = user_data["id"]
    assert user_data["username"] == "hxri_vxnu"
    assert user_data["email"] == "nharivishnu31072008@gmail.com"
    assert user_data["role"] == "INNOVATOR"
    assert user_data["has_pin"] is True
    print("PASS: User registered successfully and returned 201 Created!")

    # Step 3: Re-link invention 9 to this new user
    with engine.connect() as conn:
        conn.execute(text(f"UPDATE inventions SET creator_id = {new_user_id} WHERE id = 9"))
        conn.commit()
        print(f"PASS: Re-linked invention 9 ('water pump using cycle') to new user ID {new_user_id}!")

    # Step 4: Test Quick PIN Login with Username
    print("\n--- TEST 2: Quick PIN Login with Username ---")
    pin_res = client.post("/api/auth/pin-login", json={"username": "hxri_vxnu", "pin": "3178"})
    print(f"Status: {pin_res.status_code}")
    assert pin_res.status_code == 200, f"Expected 200, got {pin_res.status_code}: {pin_res.text}"
    assert "access_token" in pin_res.json()
    print("PASS: PIN login with @username succeeded!")

    # Step 5: Test Quick PIN Login with Email as identifier
    print("\n--- TEST 3: Quick PIN Login with Email ---")
    pin_res_email = client.post("/api/auth/pin-login", json={"username": "nharivishnu31072008@gmail.com", "pin": "3178"})
    print(f"Status: {pin_res_email.status_code}")
    assert pin_res_email.status_code == 200, f"Expected 200, got {pin_res_email.status_code}: {pin_res_email.text}"
    print("PASS: PIN login with email identifier succeeded!")

    # Step 6: Test Email + Password Login
    print("\n--- TEST 4: Email & Password Login ---")
    pw_res = client.post("/api/auth/login", json={"email": "nharivishnu31072008@gmail.com", "password": "310708"})
    print(f"Status: {pw_res.status_code}")
    assert pw_res.status_code == 200, f"Expected 200, got {pw_res.status_code}: {pw_res.text}"
    print("PASS: Email & Password login succeeded!")

    # Step 7: Test Duplicate Email Rejection
    print("\n--- TEST 5: Duplicate Email Rejection ---")
    dup_email_payload = {
        "full_name": "Another User",
        "username": "another_user",
        "email": "nharivishnu31072008@gmail.com",
        "password": "secretpassword",
        "pin": "5555",
        "role": "INNOVATOR"
    }
    dup_res = client.post("/api/auth/register", json=dup_email_payload)
    print(f"Status: {dup_res.status_code}")
    print(f"Response: {dup_res.json()}")
    assert dup_res.status_code == 400
    assert dup_res.json()["detail"] == "An account with this email already exists."
    print("PASS: Duplicate email correctly rejected with clear 400 error!")

    # Step 8: Test Duplicate Username Rejection
    print("\n--- TEST 6: Duplicate Username Rejection ---")
    dup_uname_payload = {
        "full_name": "Different Name",
        "username": "hxri_vxnu",
        "email": "different_unique_email@gmail.com",
        "password": "secretpassword",
        "pin": "5555",
        "role": "INNOVATOR"
    }
    dup_u_res = client.post("/api/auth/register", json=dup_uname_payload)
    print(f"Status: {dup_u_res.status_code}")
    print(f"Response: {dup_u_res.json()}")
    assert dup_u_res.status_code == 400
    assert dup_u_res.json()["detail"] == "Username already taken."
    print("PASS: Duplicate username correctly rejected with clear 400 error!")

    # Step 9: Test Wrong PIN Rejection
    print("\n--- TEST 7: Wrong PIN Rejection ---")
    wrong_pin_res = client.post("/api/auth/pin-login", json={"username": "hxri_vxnu", "pin": "9999"})
    print(f"Status: {wrong_pin_res.status_code}")
    assert wrong_pin_res.status_code == 401
    print("PASS: Wrong PIN correctly rejected with 401 Unauthorized!")

    print("\n==========================================")
    print("ALL 7 END-TO-END VERIFICATION CHECKS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
