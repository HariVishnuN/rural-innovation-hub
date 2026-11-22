import sys
import os
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User

client = TestClient(app)

print("--- Starting End-to-End PIN & Authentication Tests ---")

test_email = "test_artisan_2026@ruralhub.org"
test_username = "artisan_2026"
test_password = "ArtisanPassword@123"
test_pin = "4321"

# Step 0: Clean up test user if exists
db = SessionLocal()
db.query(User).filter((User.email == test_email) | (User.username == test_username)).delete()
db.commit()

# Step 1: Register new user with username and 4-digit PIN
reg_payload = {
    "full_name": "Artisan Ramesh Tester",
    "username": test_username,
    "email": test_email,
    "password": test_password,
    "pin": test_pin,
    "role": "INNOVATOR",
    "state": "Gujarat",
    "consent_given": True,
}

reg_res = client.post("/api/auth/register", json=reg_payload)
assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
reg_data = reg_res.json()
print("SUCCESS 1: Registered user with username & PIN. Token:", bool(reg_data.get("access_token")))
assert reg_data["user"]["username"] == test_username
assert reg_data["user"]["has_pin"] is True

# Step 2: Verify database storage (pin_hash is hashed, NOT plaintext)
user_db = db.query(User).filter(User.email == test_email).first()
assert user_db is not None
assert user_db.pin_hash != test_pin, "SECURITY ERROR: PIN is stored in plain text!"
assert user_db.pin_hash.startswith("$2b$") or user_db.pin_hash.startswith("$2a$"), "PIN hash is not bcrypt!"
print("SUCCESS 2: Verified MySQL database storage: pin_hash is bcrypt hash (not plaintext).")

# Step 3: Test Email + Password Login
login_res = client.post("/api/auth/login", json={"email": test_email, "password": test_password})
assert login_res.status_code == 200, f"Login failed: {login_res.text}"
print("SUCCESS 3: Email + Password Login succeeded with 200 OK.")

# Step 4: Test Quick PIN Login with Username
pin_res = client.post("/api/auth/pin-login", json={"username": test_username, "pin": test_pin})
assert pin_res.status_code == 200, f"PIN Login failed: {pin_res.text}"
auth_token = pin_res.json()["access_token"]
print("SUCCESS 4: Quick PIN Login with username succeeded with 200 OK.")

# Step 5: Test Quick PIN Login with Email as Identifier
pin_email_res = client.post("/api/auth/pin-login", json={"username": test_email, "pin": test_pin})
assert pin_email_res.status_code == 200, f"PIN Login with email failed: {pin_email_res.text}"
print("SUCCESS 5: Quick PIN Login using email as identifier succeeded with 200 OK.")

# Step 6: Test Wrong PIN returns 401
wrong_pin_res = client.post("/api/auth/pin-login", json={"username": test_username, "pin": "9999"})
assert wrong_pin_res.status_code == 401
print("SUCCESS 6: Wrong PIN correctly rejected with 401 Unauthorized.")

# Step 7: Test Profile PATCH /api/users/me (Update PIN to 9876)
patch_res = client.patch(
    "/api/users/me",
    headers={"Authorization": f"Bearer {auth_token}"},
    json={"pin": "9876", "village_city": "Navsari"},
)
assert patch_res.status_code == 200, f"Profile patch failed: {patch_res.text}"
print("SUCCESS 7: Profile PIN update succeeded.")

# Step 8: Verify new PIN 9876 works and old PIN 4321 fails
old_pin_test = client.post("/api/auth/pin-login", json={"username": test_username, "pin": "4321"})
assert old_pin_test.status_code == 401

new_pin_test = client.post("/api/auth/pin-login", json={"username": test_username, "pin": "9876"})
assert new_pin_test.status_code == 200
print("SUCCESS 8: New PIN 9876 authenticated successfully; old PIN rejected.")

# Step 9: Clean up test user
db.query(User).filter((User.email == test_email) | (User.username == test_username)).delete()
db.commit()
db.close()

print("--- ALL 8 AUTHENTICATION & PIN SECURITY TESTS PASSED CLEANLY! ---")
