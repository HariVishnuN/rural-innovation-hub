def test_material_optimization_heuristic(client):
    """Verifies that rule-based material optimizer suggests upcycled scrap alternatives."""
    payload = {
        "materials": [
            {
                "item_name": "Mild Steel Pipe 2-inch",
                "quantity": "2 meters",
                "unit_cost": "1000.00",
                "local_source": "Hardware",
                "optimized_alternative": "",
                "estimated_savings": "0.00",
            },
            {
                "item_name": "Ball Bearing 6204",
                "quantity": "2 units",
                "unit_cost": "500.00",
                "local_source": "Machinery Store",
                "optimized_alternative": "",
                "estimated_savings": "0.00",
            },
        ]
    }
    response = client.post("/api/inventions/material-optimization", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "original_total" in data
    assert "optimized_total" in data
    assert float(data["potential_savings"]) > 0
    assert len(data["suggestions"]) == 2


def test_similarity_check_heuristic(client):
    """Verifies heuristic duplicate check endpoint."""
    payload = {
        "title": "Low Cost Solar Drip Irrigation Drum",
        "description": "Gravity fed micro drip irrigation using recycled plastic drums and solar pump",
        "category": "Water & Irrigation",
    }
    response = client.post("/api/inventions/similarity-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "matches" in data
    assert "message" in data
