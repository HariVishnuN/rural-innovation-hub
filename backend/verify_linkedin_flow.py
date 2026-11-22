import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_linkedin_innovation_flow():
    print("=== STARTING LINKEDIN-STYLE INNOVATION FEED & DASHBOARD VERIFICATION ===")

    # 1. Login as Innovator (Ramesh Patel)
    print("\n--- STEP 1: Login as Innovator ---")
    innovator_login = client.post("/api/auth/pin-login", json={"username": "ramesh", "pin": "1234"})
    assert innovator_login.status_code == 200, f"Login failed: {innovator_login.text}"
    innovator_token = innovator_login.json()["access_token"]
    innovator_id = innovator_login.json()["user"]["id"]
    print(f"Logged in as Innovator Ramesh Patel (ID: {innovator_id})")

    # 2. Innovator posts a new invention
    print("\n--- STEP 2: Post New Invention ---")
    new_inv_payload = {
        "title": "Solar Powered Grain Moisture Detector & Desiccant Drier",
        "category": "Agriculture",
        "region": "Gujarat",
        "description": "Ultra low-cost digital grain moisture sensor combined with solar-thermal desiccant aeration chamber preventing post-harvest fungal aflatoxin growth.",
        "assembly_steps": [
            {"step": 1, "title": "Sensor Calibration", "details": "Calibrate electrical conductivity probes for paddy and wheat.", "audio_text": "", "tool_required": "Multimeter"},
            {"step": 2, "title": "Chamber Assembly", "details": "Construct sheet-metal solar collector box with silica gel bed.", "audio_text": "", "tool_required": "Sheet metal shears"}
        ],
        "materials": [
            {"item_name": "Galvanized Iron Sheet 24G", "quantity": "2 sheets", "unit_cost": 1200.00, "local_source": "Anand hardware market"},
            {"item_name": "Digital Moisture Sensor Probe", "quantity": "1 unit", "unit_cost": 850.00, "local_source": "Local electronic shop"}
        ],
        "image_url": "/images/inventions/solar-distiller.svg",
        "scaling_stage": "FIELD_TESTED",
        "estimated_co2_savings_kg": 80.00,
        "estimated_water_savings_liters": 1500.00
    }

    create_res = client.post(
        "/api/inventions",
        json=new_inv_payload,
        headers={"Authorization": f"Bearer {innovator_token}"}
    )
    assert create_res.status_code == 201, f"Create invention failed: {create_res.text}"
    new_inv = create_res.json()
    new_inv_id = new_inv["id"]
    print(f"Created Invention ID: {new_inv_id}, Title: {new_inv['title']}")
    assert new_inv["moderation_status"] == "APPROVED", "Invention must be APPROVED by default for immediate public visibility"
    print("PASS: Invention created with immediate APPROVED status!")

    # 3. Verify immediate appearance on public feed
    print("\n--- STEP 3: Confirm Immediate Visibility on Public Feed ---")
    feed_res = client.get("/api/inventions?limit=10")
    assert feed_res.status_code == 200
    feed_items = feed_res.json()
    matched = [item for item in feed_items if item["id"] == new_inv_id]
    assert len(matched) == 1, "New invention must appear immediately in public feed!"
    print(f"PASS: Invention {new_inv_id} appears at the top of the public feed!")

    # 4. Login as Official / Investor (Vikram Deshmukh)
    print("\n--- STEP 4: Login as Official / Investor ---")
    official_login = client.post("/api/auth/pin-login", json={"username": "vikram", "pin": "1234"})
    assert official_login.status_code == 200, f"Official login failed: {official_login.text}"
    official_token = official_login.json()["access_token"]
    print("Logged in as Official Vikram Deshmukh (NABARD)")

    # 5. Official Likes the Invention
    print("\n--- STEP 5: Official Likes Invention ---")
    like_res = client.post(
        f"/api/inventions/{new_inv_id}/like",
        headers={"Authorization": f"Bearer {official_token}"}
    )
    assert like_res.status_code == 200, f"Like failed: {like_res.text}"
    like_data = like_res.json()
    assert like_data["liked"] is True
    assert like_data["likes_count"] == 1
    print("PASS: Official successfully liked the invention! Likes Count = 1")

    # 6. Official Comments on Invention
    print("\n--- STEP 6: Official Comments on Invention ---")
    comment_res = client.post(
        f"/api/inventions/{new_inv_id}/comments",
        json={"comment_text": "Excellent engineering. NABARD would like to license this blueprint for 15 farmer collectives in Saurashtra."},
        headers={"Authorization": f"Bearer {official_token}"}
    )
    assert comment_res.status_code == 201, f"Comment failed: {comment_res.text}"
    comment_data = comment_res.json()
    assert comment_data["user_name"] == "Vikram Deshmukh"
    assert "NABARD" in comment_data["comment_text"]
    print(f"PASS: Comment posted successfully by {comment_data['user_name']}!")

    # Verify comments list
    comments_list = client.get(f"/api/inventions/{new_inv_id}/comments").json()
    assert len(comments_list) == 1
    print("PASS: Comments list endpoint returned comment accurately!")

    # 7. Official submits a Paid Reuse offer
    print("\n--- STEP 7: Official Submits Paid Reuse Offer ---")
    offer_payload = {
        "offer_type": "Paid Reuse",
        "organization_name": "NABARD Rural Enterprise Fund",
        "proposed_amount": 65000.00,
        "amount_inr": 65000.00,
        "official_name": "Vikram Deshmukh",
        "official_email": "vikram@nabard.org",
        "official_phone": "+91 94220 55667",
        "message": "We are paying ₹65,000 for licensing rights to fabricate and distribute 15 units across Saurashtra farmer clusters."
    }
    offer_res = client.post(
        f"/api/inventions/{new_inv_id}/offers",
        json=offer_payload,
        headers={"Authorization": f"Bearer {official_token}"}
    )
    assert offer_res.status_code == 201, f"Offer creation failed: {offer_res.text}"
    offer_data = offer_res.json()
    offer_id = offer_data["id"]
    print(f"PASS: Commercial Paid Reuse offer created with ID {offer_id} for ₹{offer_data['proposed_amount']}!")

    # 8. Verify Invention live counts on public feed
    print("\n--- STEP 8: Verify Live Counts on Public Feed ---")
    inv_detail = client.get(f"/api/inventions/{new_inv_id}").json()
    print(f"Likes: {inv_detail['likes_count']}, Comments: {inv_detail['comments_count']}, Paid Reuses: {inv_detail['paid_reuses_count']}")
    assert inv_detail["likes_count"] == 1
    assert inv_detail["comments_count"] == 1
    assert inv_detail["paid_reuses_count"] >= 1
    print("PASS: Public feed reflects updated like, comment, and paid reuse counts!")

    # 9. Innovator inspects Private Dashboard
    print("\n--- STEP 9: Innovator Inspects Private Dashboard ---")
    dash_res = client.get(
        "/api/users/me/dashboard",
        headers={"Authorization": f"Bearer {innovator_token}"}
    )
    assert dash_res.status_code == 200, f"Dashboard fetch failed: {dash_res.text}"
    dashboard = dash_res.json()

    # Confirm invention appears in my inventions list
    my_invs = [i for i in dashboard["inventions"] if i["id"] == new_inv_id]
    assert len(my_invs) == 1, "New invention must be in innovator's private dashboard!"
    assert my_invs[0]["likes_count"] == 1
    assert my_invs[0]["comments_count"] == 1

    # Confirm buyer appears in private buyers list
    matched_buyer = [b for b in dashboard["buyers"] if b["id"] == offer_id]
    assert len(matched_buyer) == 1, "Buyer offer must appear in innovator's private buyers list!"
    buyer = matched_buyer[0]
    assert buyer["buyer_name"] == "Vikram Deshmukh"
    assert buyer["organization_name"] == "NABARD Rural Enterprise Fund"
    assert buyer["offer_type"] == "Paid Reuse"
    assert Decimal(str(buyer["amount_inr"])) == Decimal("65000.00")
    assert buyer["status"] == "PENDING"
    print(f"PASS: Innovator private dashboard displays buyer {buyer['buyer_name']} ({buyer['organization_name']}) for ₹{buyer['amount_inr']}!")

    # 10. Innovator accepts offer
    print("\n--- STEP 10: Innovator Accepts Offer ---")
    accept_res = client.patch(
        f"/api/offers/{offer_id}/status",
        json={"status": "ACCEPTED"},
        headers={"Authorization": f"Bearer {innovator_token}"}
    )
    assert accept_res.status_code == 200, f"Accept failed: {accept_res.text}"
    assert accept_res.json()["status"] == "ACCEPTED"
    print("PASS: Offer successfully accepted by innovator!")

    print("\n=======================================================")
    print("ALL 10 LINKEDIN FEED & INNOVATOR DASHBOARD TESTS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    test_linkedin_innovation_flow()
