def test_health_check(client):
    """Verifies that the /health and /api/health endpoints respond properly."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data


def test_demo_accounts_endpoint(client):
    """Verifies that demo accounts are listed when DEMO_MODE is true."""
    response = client.get("/api/auth/demo-accounts")
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) >= 4
    roles = [a["role"] for a in accounts]
    assert "INNOVATOR" in roles
    assert "INVESTOR" in roles
    assert "MENTOR" in roles
    assert "ADMIN" in roles


def test_admin_role_self_registration_forbidden(client):
    """Verifies that public registration explicitly blocks selecting the ADMIN role."""
    payload = {
        "full_name": "Rogue Admin Attempt",
        "email": "rogue@example.com",
        "password": "Password123!",
        "role": "ADMIN",
        "consent_given": True,
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Admin role cannot be self-selected" in response.json()["detail"]
