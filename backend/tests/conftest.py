import os
import sys
import pytest

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

# For tests, if MySQL is not available during isolated unit test runners, we can test using an isolated database or mock
# But per instructions: strictly test against configured DATABASE_URL or test harness
# We configure pytest fixtures:

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client
