"""
TGME Phase 3 MSP Platform Enhancement Tests
Tests for:
1. AMC Form Enhancement - Number of Visits field and asset linking
2. Asset Service History API endpoint
3. Client Portal - Auth, dashboard, assets, AMCs, tickets
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


# ==================== FIXTURES ====================

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def test_client_id(api_client):
    """Get a valid client ID for testing"""
    response = api_client.get(f"{BASE_URL}/api/workspace/clients")
    assert response.status_code == 200
    clients = response.json()
    assert len(clients) > 0, "No clients found for testing"
    return clients[0]["id"]


@pytest.fixture(scope="module")
def portal_user_data(test_client_id):
    """Generate portal user test data"""
    timestamp = int(time.time())
    return {
        "client_id": test_client_id,
        "name": f"TEST_Portal User {timestamp}",
        "email": f"test_portal_{timestamp}@example.com",
        "phone": "9876543210",
        "password": "TestPass123"
    }


@pytest.fixture(scope="module")
def portal_user(api_client, portal_user_data):
    """Create a portal user for testing and cleanup after"""
    response = api_client.post(f"{BASE_URL}/api/portal/users", json=portal_user_data)
    assert response.status_code == 200
    user = response.json()
    yield user
    # Cleanup
    api_client.delete(f"{BASE_URL}/api/portal/users/{user['id']}")


@pytest.fixture(scope="module")
def portal_token(api_client, portal_user, portal_user_data):
    """Login to portal and get token"""
    response = api_client.post(f"{BASE_URL}/api/portal/auth/login", json={
        "email": portal_user_data["email"],
        "password": portal_user_data["password"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    yield data["token"]
    # Logout
    api_client.post(f"{BASE_URL}/api/portal/auth/logout?token={data['token']}")


@pytest.fixture(scope="module")
def test_asset(api_client, test_client_id):
    """Create a test asset for service history testing"""
    asset_data = {
        "type": "laptop",
        "brand": "TEST_Dell",
        "model": "TestBook Pro",
        "serial_number": f"TSTSN{int(time.time())}",
        "status": "active",
        "client_id": test_client_id,
        "specs": {"processor": "Intel i7", "ram": "16GB"}
    }
    response = api_client.post(f"{BASE_URL}/api/workspace/assets", json=asset_data)
    assert response.status_code == 200
    asset = response.json()
    yield asset
    # Cleanup
    api_client.delete(f"{BASE_URL}/api/workspace/assets/{asset['id']}")


# ==================== PORTAL USER MANAGEMENT ====================

class TestPortalUserManagement:
    """Tests for Portal User CRUD operations (Admin API)"""

    def test_create_portal_user_success(self, api_client, test_client_id):
        """Test creating a portal user"""
        timestamp = int(time.time())
        data = {
            "client_id": test_client_id,
            "name": f"TEST_Portal Create {timestamp}",
            "email": f"test_create_{timestamp}@example.com",
            "phone": "1234567890",
            "password": "CreatePass123"
        }
        response = api_client.post(f"{BASE_URL}/api/portal/users", json=data)
        assert response.status_code == 200
        user = response.json()
        assert "id" in user
        assert user["email"] == data["email"].lower()
        assert "client_name" in user
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/portal/users/{user['id']}")

    def test_create_portal_user_invalid_client(self, api_client):
        """Test creating portal user with invalid client ID"""
        data = {
            "client_id": "000000000000000000000000",
            "name": "TEST_Invalid",
            "email": "invalid@example.com",
            "phone": "",
            "password": "Pass123"
        }
        response = api_client.post(f"{BASE_URL}/api/portal/users", json=data)
        assert response.status_code == 404

    def test_list_portal_users(self, api_client, portal_user):
        """Test listing portal users"""
        response = api_client.get(f"{BASE_URL}/api/portal/users")
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        # Check our test user is in the list
        user_ids = [u["id"] for u in users]
        assert portal_user["id"] in user_ids

    def test_delete_portal_user(self, api_client, test_client_id):
        """Test deactivating a portal user"""
        # Create a user to delete
        timestamp = int(time.time())
        data = {
            "client_id": test_client_id,
            "name": f"TEST_ToDelete {timestamp}",
            "email": f"test_delete_{timestamp}@example.com",
            "phone": "",
            "password": "DeleteMe123"
        }
        create_resp = api_client.post(f"{BASE_URL}/api/portal/users", json=data)
        assert create_resp.status_code == 200
        user_id = create_resp.json()["id"]
        
        # Delete
        delete_resp = api_client.delete(f"{BASE_URL}/api/portal/users/{user_id}")
        assert delete_resp.status_code == 200
        
        # Verify user is deactivated (not in active list)
        list_resp = api_client.get(f"{BASE_URL}/api/portal/users")
        active_ids = [u["id"] for u in list_resp.json()]
        assert user_id not in active_ids


# ==================== PORTAL AUTH ====================

class TestPortalAuth:
    """Tests for Portal Authentication"""

    def test_portal_login_success(self, api_client, portal_user, portal_user_data):
        """Test successful portal login"""
        response = api_client.post(f"{BASE_URL}/api/portal/auth/login", json={
            "email": portal_user_data["email"],
            "password": portal_user_data["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == portal_user_data["email"].lower()
        assert data["user"]["name"] == portal_user_data["name"]
        assert "client_id" in data["user"]
        assert "client_name" in data["user"]

    def test_portal_login_wrong_password(self, api_client, portal_user_data):
        """Test login with wrong password"""
        response = api_client.post(f"{BASE_URL}/api/portal/auth/login", json={
            "email": portal_user_data["email"],
            "password": "WrongPassword123"
        })
        assert response.status_code == 401

    def test_portal_login_nonexistent_email(self, api_client):
        """Test login with non-existent email"""
        response = api_client.post(f"{BASE_URL}/api/portal/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "SomePass123"
        })
        assert response.status_code == 401

    def test_portal_verify_token(self, api_client, portal_token):
        """Test token verification"""
        response = api_client.get(f"{BASE_URL}/api/portal/auth/verify?token={portal_token}")
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert "user" in data

    def test_portal_verify_invalid_token(self, api_client):
        """Test verification with invalid token"""
        response = api_client.get(f"{BASE_URL}/api/portal/auth/verify?token=invalid_token_12345")
        assert response.status_code == 401

    def test_portal_logout(self, api_client, test_client_id):
        """Test logout invalidates token"""
        # Create user and login
        timestamp = int(time.time())
        user_data = {
            "client_id": test_client_id,
            "name": f"TEST_Logout {timestamp}",
            "email": f"test_logout_{timestamp}@example.com",
            "phone": "",
            "password": "LogoutTest123"
        }
        create_resp = api_client.post(f"{BASE_URL}/api/portal/users", json=user_data)
        user_id = create_resp.json()["id"]
        
        login_resp = api_client.post(f"{BASE_URL}/api/portal/auth/login", json={
            "email": user_data["email"],
            "password": user_data["password"]
        })
        token = login_resp.json()["token"]
        
        # Logout
        logout_resp = api_client.post(f"{BASE_URL}/api/portal/auth/logout?token={token}")
        assert logout_resp.status_code == 200
        
        # Verify token is invalid now
        verify_resp = api_client.get(f"{BASE_URL}/api/portal/auth/verify?token={token}")
        assert verify_resp.status_code == 401
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/portal/users/{user_id}")


# ==================== PORTAL DATA ENDPOINTS ====================

class TestPortalDashboard:
    """Tests for Portal Dashboard endpoint"""

    def test_get_dashboard(self, api_client, portal_token):
        """Test getting dashboard data"""
        response = api_client.get(f"{BASE_URL}/api/portal/my/dashboard?token={portal_token}")
        assert response.status_code == 200
        data = response.json()
        assert "client_name" in data
        assert "total_assets" in data
        assert "active_assets" in data
        assert "active_amcs" in data
        assert "active_licenses" in data
        assert "recent_tasks" in data
        assert isinstance(data["recent_tasks"], list)

    def test_dashboard_unauthorized(self, api_client):
        """Test dashboard without token"""
        response = api_client.get(f"{BASE_URL}/api/portal/my/dashboard?token=invalid")
        assert response.status_code == 401


class TestPortalAssets:
    """Tests for Portal Assets endpoint"""

    def test_get_assets(self, api_client, portal_token):
        """Test getting assets list"""
        response = api_client.get(f"{BASE_URL}/api/portal/my/assets?token={portal_token}")
        assert response.status_code == 200
        assets = response.json()
        assert isinstance(assets, list)
        if len(assets) > 0:
            asset = assets[0]
            assert "id" in asset
            assert "asset_tag" in asset
            assert "type" in asset
            assert "brand" in asset
            assert "status" in asset

    def test_get_assets_with_search(self, api_client, portal_token):
        """Test assets search filter"""
        response = api_client.get(f"{BASE_URL}/api/portal/my/assets?token={portal_token}&search=laptop")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_assets_unauthorized(self, api_client):
        """Test assets without token"""
        response = api_client.get(f"{BASE_URL}/api/portal/my/assets?token=invalid")
        assert response.status_code == 401


class TestPortalAMCs:
    """Tests for Portal AMCs endpoint"""

    def test_get_amcs(self, api_client, portal_token):
        """Test getting AMC contracts"""
        response = api_client.get(f"{BASE_URL}/api/portal/my/amcs?token={portal_token}")
        assert response.status_code == 200
        amcs = response.json()
        assert isinstance(amcs, list)
        if len(amcs) > 0:
            amc = amcs[0]
            assert "id" in amc
            assert "contract_name" in amc
            assert "status" in amc
            # Phase 3 new field
            assert "number_of_visits" in amc


class TestPortalEmployees:
    """Tests for Portal Employees/Contacts endpoint"""

    def test_get_employees(self, api_client, portal_token):
        """Test getting client contacts"""
        response = api_client.get(f"{BASE_URL}/api/portal/my/employees?token={portal_token}")
        assert response.status_code == 200
        employees = response.json()
        assert isinstance(employees, list)


class TestPortalTickets:
    """Tests for Portal Tickets endpoint"""

    def test_get_tickets(self, api_client, portal_token):
        """Test getting tickets list"""
        response = api_client.get(f"{BASE_URL}/api/portal/my/tickets?token={portal_token}")
        assert response.status_code == 200
        tickets = response.json()
        assert isinstance(tickets, list)

    def test_create_ticket(self, api_client, portal_token):
        """Test creating a support ticket"""
        ticket_data = {
            "subject": "TEST_Ticket - System Issue",
            "description": "This is a test ticket created by automated tests",
            "priority": "normal"
        }
        response = api_client.post(f"{BASE_URL}/api/portal/my/tickets?token={portal_token}", json=ticket_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data

    def test_create_ticket_missing_fields(self, api_client, portal_token):
        """Test creating ticket with missing fields"""
        ticket_data = {"subject": ""}
        response = api_client.post(f"{BASE_URL}/api/portal/my/tickets?token={portal_token}", json=ticket_data)
        # Should return 422 validation error
        assert response.status_code == 422


# ==================== AMC ENHANCEMENTS (Phase 3) ====================

class TestAMCEnhancements:
    """Tests for AMC Form Enhancement - number_of_visits and asset linking"""

    def test_create_amc_with_visits(self, api_client, test_client_id):
        """Test creating AMC with number_of_visits field"""
        amc_data = {
            "client_id": test_client_id,
            "contract_name": f"TEST_AMC Visits {int(time.time())}",
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "coverage_type": "comprehensive",
            "amount": 50000,
            "number_of_visits": 12,
            "visit_frequency": "monthly",
            "status": "active"
        }
        response = api_client.post(f"{BASE_URL}/api/workspace/subscriptions/amc", json=amc_data)
        assert response.status_code == 200
        amc = response.json()
        assert "id" in amc
        assert amc["number_of_visits"] == 12
        assert amc["visit_frequency"] == "monthly"
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/workspace/subscriptions/amc/{amc['id']}")

    def test_create_amc_with_asset_linking(self, api_client, test_client_id, test_asset):
        """Test creating AMC with linked assets"""
        amc_data = {
            "client_id": test_client_id,
            "contract_name": f"TEST_AMC Assets {int(time.time())}",
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "coverage_type": "comprehensive",
            "amount": 75000,
            "number_of_visits": 4,
            "asset_ids": [test_asset["id"]],
            "status": "active"
        }
        response = api_client.post(f"{BASE_URL}/api/workspace/subscriptions/amc", json=amc_data)
        assert response.status_code == 200
        amc = response.json()
        assert "id" in amc
        assert test_asset["id"] in amc.get("asset_ids", [])
        
        # Verify linked assets via GET
        get_resp = api_client.get(f"{BASE_URL}/api/workspace/subscriptions/amc/{amc['id']}")
        assert get_resp.status_code == 200
        amc_detail = get_resp.json()
        assert "linked_assets" in amc_detail
        assert len(amc_detail["linked_assets"]) == 1
        assert amc_detail["linked_assets"][0]["id"] == test_asset["id"]
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/workspace/subscriptions/amc/{amc['id']}")

    def test_amc_list_shows_visits(self, api_client, test_client_id):
        """Test AMC list shows number_of_visits"""
        # Create AMC
        amc_data = {
            "client_id": test_client_id,
            "contract_name": f"TEST_AMC List {int(time.time())}",
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "number_of_visits": 6,
            "status": "active"
        }
        create_resp = api_client.post(f"{BASE_URL}/api/workspace/subscriptions/amc", json=amc_data)
        amc_id = create_resp.json()["id"]
        
        # List AMCs
        list_resp = api_client.get(f"{BASE_URL}/api/workspace/subscriptions/amc")
        assert list_resp.status_code == 200
        amcs = list_resp.json()
        test_amc = next((a for a in amcs if a["id"] == amc_id), None)
        assert test_amc is not None
        assert "number_of_visits" in test_amc
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/workspace/subscriptions/amc/{amc_id}")


# ==================== ASSET SERVICE HISTORY (Phase 3) ====================

class TestAssetServiceHistory:
    """Tests for Asset Service History endpoint"""

    def test_get_service_history(self, api_client, test_asset):
        """Test getting service history for an asset"""
        response = api_client.get(f"{BASE_URL}/api/workspace/assets/{test_asset['id']}/service-history")
        assert response.status_code == 200
        data = response.json()
        assert "asset_id" in data
        assert data["asset_id"] == test_asset["id"]
        assert "asset_tag" in data
        assert "service_entries" in data
        assert "tasks" in data
        assert "amc_contracts" in data
        assert "assignment_history" in data
        assert "status_history" in data
        assert isinstance(data["service_entries"], list)
        assert isinstance(data["tasks"], list)

    def test_service_history_invalid_asset(self, api_client):
        """Test service history for non-existent asset"""
        response = api_client.get(f"{BASE_URL}/api/workspace/assets/000000000000000000000000/service-history")
        assert response.status_code == 404


# ==================== WORKSPACE PORTAL INTEGRATION ====================

class TestWorkspacePortalIntegration:
    """Tests for workspace portal user API integration"""

    def test_workspace_clients_endpoint(self, api_client):
        """Test that clients endpoint works (needed for portal user creation)"""
        response = api_client.get(f"{BASE_URL}/api/workspace/clients")
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        if len(clients) > 0:
            assert "id" in clients[0]
            assert "company_name" in clients[0]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
