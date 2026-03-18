"""
Asset Management API Tests for TGME ServiceBook
Tests: CRUD for assets, accessories, QR code generation, filtering, stats
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
API_BASE = f"{BASE_URL}/api/workspace/assets"

# Test client ID from database
TEST_CLIENT_ID = "69b41f099933a06b72f61bdf"  # TEST_Acme Corp

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestAssetStats:
    """Test /api/workspace/assets/stats endpoint"""
    
    def test_stats_returns_valid_data(self, api_client):
        """GET /stats returns expected structure"""
        response = api_client.get(f"{API_BASE}/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "total" in data
        assert "active" in data
        assert "in_repair" in data
        assert "in_stock" in data
        assert "retired" in data
        assert "warranty_expiring" in data
        assert "type_breakdown" in data
        
        # All counts should be integers >= 0
        assert isinstance(data["total"], int) and data["total"] >= 0
        assert isinstance(data["active"], int) and data["active"] >= 0
        
    def test_stats_with_client_filter(self, api_client):
        """GET /stats?client_id filters by client"""
        response = api_client.get(f"{API_BASE}/stats?client_id={TEST_CLIENT_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data


class TestAssetCRUD:
    """Test Asset Create/Read/Update/Delete operations"""
    
    created_asset_id = None
    created_asset_tag = None
    
    def test_create_asset(self, api_client):
        """POST /assets creates a new asset"""
        payload = {
            "type": "laptop",
            "brand": "TEST_Dell",
            "model": "Latitude 5530",
            "serial_number": "TEST_SN123456",
            "status": "active",
            "client_id": TEST_CLIENT_ID,
            "assigned_to": "Test User",
            "notes": "Test asset for automated testing"
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 200, f"Create asset failed: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "id" in data
        assert "asset_tag" in data
        assert data["asset_tag"].startswith("TGME-AST-")
        assert data["brand"] == "TEST_Dell"
        assert data["model"] == "Latitude 5530"
        assert data["type"] == "laptop"
        assert data["status"] == "active"
        
        # Store for subsequent tests
        TestAssetCRUD.created_asset_id = data["id"]
        TestAssetCRUD.created_asset_tag = data["asset_tag"]
        print(f"Created asset: {data['asset_tag']} (ID: {data['id']})")
    
    def test_get_asset_list(self, api_client):
        """GET /assets returns list of assets"""
        response = api_client.get(API_BASE)
        assert response.status_code == 200
        
        data = response.json()
        assert "assets" in data
        assert "total" in data
        assert isinstance(data["assets"], list)
        assert data["total"] >= 1  # At least our created asset
        
    def test_get_asset_list_with_search(self, api_client):
        """GET /assets?search= filters by search term"""
        response = api_client.get(f"{API_BASE}?search=TEST_Dell")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] >= 1
        assert any("TEST_Dell" in a.get("brand", "") for a in data["assets"])
        
    def test_get_asset_list_with_type_filter(self, api_client):
        """GET /assets?type= filters by asset type"""
        response = api_client.get(f"{API_BASE}?type=laptop")
        assert response.status_code == 200
        
        data = response.json()
        # All returned assets should be laptops
        for asset in data["assets"]:
            assert asset["type"] == "laptop"
            
    def test_get_asset_list_with_status_filter(self, api_client):
        """GET /assets?status= filters by status"""
        response = api_client.get(f"{API_BASE}?status=active")
        assert response.status_code == 200
        
        data = response.json()
        for asset in data["assets"]:
            assert asset["status"] == "active"
            
    def test_get_asset_list_with_client_filter(self, api_client):
        """GET /assets?client_id= filters by client"""
        response = api_client.get(f"{API_BASE}?client_id={TEST_CLIENT_ID}")
        assert response.status_code == 200
        
        data = response.json()
        for asset in data["assets"]:
            assert asset["client_id"] == TEST_CLIENT_ID
    
    def test_get_single_asset(self, api_client):
        """GET /assets/{id} returns asset with accessories"""
        if not TestAssetCRUD.created_asset_id:
            pytest.skip("No asset created")
            
        response = api_client.get(f"{API_BASE}/{TestAssetCRUD.created_asset_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == TestAssetCRUD.created_asset_id
        assert data["asset_tag"] == TestAssetCRUD.created_asset_tag
        assert "accessories" in data
        assert isinstance(data["accessories"], list)
        assert "maintenance_history" in data
        
    def test_get_asset_not_found(self, api_client):
        """GET /assets/{invalid_id} returns 404"""
        response = api_client.get(f"{API_BASE}/000000000000000000000000")
        assert response.status_code == 404
        
    def test_update_asset(self, api_client):
        """PUT /assets/{id} updates asset"""
        if not TestAssetCRUD.created_asset_id:
            pytest.skip("No asset created")
            
        payload = {
            "status": "in_repair",
            "notes": "Updated notes - in repair for testing"
        }
        
        response = api_client.put(f"{API_BASE}/{TestAssetCRUD.created_asset_id}", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "in_repair"
        assert "Updated notes" in data["notes"]
        
        # Verify persistence with GET
        get_response = api_client.get(f"{API_BASE}/{TestAssetCRUD.created_asset_id}")
        get_data = get_response.json()
        assert get_data["status"] == "in_repair"
        
    def test_update_asset_no_fields(self, api_client):
        """PUT /assets/{id} with empty body returns 400"""
        if not TestAssetCRUD.created_asset_id:
            pytest.skip("No asset created")
            
        response = api_client.put(f"{API_BASE}/{TestAssetCRUD.created_asset_id}", json={})
        assert response.status_code == 400


class TestAssetQRCode:
    """Test QR Code generation"""
    
    def test_get_qr_code(self, api_client):
        """GET /assets/{id}/qr returns QR code data"""
        if not TestAssetCRUD.created_asset_id:
            pytest.skip("No asset created")
            
        response = api_client.get(f"{API_BASE}/{TestAssetCRUD.created_asset_id}/qr")
        assert response.status_code == 200
        
        data = response.json()
        assert "asset_tag" in data
        assert "qr_code" in data
        assert "label" in data
        assert data["asset_tag"] == TestAssetCRUD.created_asset_tag
        
        # QR code should be base64 encoded
        assert len(data["qr_code"]) > 100  # Base64 PNG is long
        
    def test_get_qr_code_not_found(self, api_client):
        """GET /assets/{invalid_id}/qr returns 404"""
        response = api_client.get(f"{API_BASE}/000000000000000000000000/qr")
        assert response.status_code == 404


class TestAccessories:
    """Test accessory management (linked assets)"""
    
    accessory_id = None
    
    def test_create_accessory(self, api_client):
        """POST /assets creates accessory linked to parent asset"""
        if not TestAssetCRUD.created_asset_id:
            pytest.skip("No parent asset created")
            
        payload = {
            "type": "keyboard",
            "brand": "TEST_Logitech",
            "model": "MX Keys",
            "serial_number": "TEST_KB12345",
            "status": "active",
            "client_id": TEST_CLIENT_ID,
            "parent_asset_id": TestAssetCRUD.created_asset_id,
            "notes": "Keyboard accessory for test laptop"
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["parent_asset_id"] == TestAssetCRUD.created_asset_id
        assert data["type"] == "keyboard"
        TestAccessories.accessory_id = data["id"]
        print(f"Created accessory: {data['asset_tag']} (ID: {data['id']})")
        
    def test_parent_asset_shows_accessories(self, api_client):
        """GET /assets/{parent_id} includes accessories in response"""
        if not TestAssetCRUD.created_asset_id or not TestAccessories.accessory_id:
            pytest.skip("No parent or accessory created")
            
        response = api_client.get(f"{API_BASE}/{TestAssetCRUD.created_asset_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "accessories" in data
        assert len(data["accessories"]) >= 1
        
        # Find our accessory
        accessory_found = False
        for acc in data["accessories"]:
            if acc["id"] == TestAccessories.accessory_id:
                accessory_found = True
                assert acc["type"] == "keyboard"
                assert acc["brand"] == "TEST_Logitech"
                break
        
        assert accessory_found, "Accessory not found in parent asset's accessories list"
        
    def test_accessories_excluded_from_parent_only_list(self, api_client):
        """GET /assets?parent_only=true excludes accessories"""
        response = api_client.get(f"{API_BASE}?parent_only=true")
        assert response.status_code == 200
        
        data = response.json()
        # Accessories should not appear in parent_only list
        for asset in data["assets"]:
            assert asset.get("parent_asset_id", "") in ["", None]


class TestClientsSummary:
    """Test clients summary endpoint"""
    
    def test_clients_asset_summary(self, api_client):
        """GET /assets/clients-summary returns per-client counts"""
        response = api_client.get(f"{API_BASE}/clients-summary")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # Each item should have client info and counts
        for item in data:
            assert "_id" in item  # client_id
            assert "client_name" in item
            assert "total" in item
            assert "active" in item


class TestAssetDelete:
    """Test asset deletion (run last to clean up)"""
    
    def test_delete_asset_with_accessories(self, api_client):
        """DELETE /assets/{id} removes asset and all accessories"""
        if not TestAssetCRUD.created_asset_id:
            pytest.skip("No asset created")
            
        # Delete parent asset (should cascade to accessories)
        response = api_client.delete(f"{API_BASE}/{TestAssetCRUD.created_asset_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["message"] == "Asset deleted"
        
        # Verify parent is gone
        get_response = api_client.get(f"{API_BASE}/{TestAssetCRUD.created_asset_id}")
        assert get_response.status_code == 404
        
        # Verify accessory is also gone
        if TestAccessories.accessory_id:
            acc_response = api_client.get(f"{API_BASE}/{TestAccessories.accessory_id}")
            assert acc_response.status_code == 404
            
    def test_delete_asset_not_found(self, api_client):
        """DELETE /assets/{invalid_id} returns 404"""
        response = api_client.delete(f"{API_BASE}/000000000000000000000000")
        assert response.status_code == 404


class TestAssetValidation:
    """Test validation and error handling"""
    
    def test_create_asset_invalid_client(self, api_client):
        """POST /assets with invalid client_id returns 404"""
        payload = {
            "type": "laptop",
            "brand": "TEST_Invalid",
            "model": "Test Model",
            "client_id": "000000000000000000000000"  # Invalid client
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 404
        assert "Client not found" in response.json().get("detail", "")


class TestStatsAfterCleanup:
    """Verify stats are accurate after test cleanup"""
    
    def test_stats_count_correct(self, api_client):
        """Stats should reflect actual database state"""
        # Get stats
        stats_response = api_client.get(f"{API_BASE}/stats")
        stats = stats_response.json()
        
        # Get actual asset list
        list_response = api_client.get(f"{API_BASE}?parent_only=true")
        list_data = list_response.json()
        
        # Total should match
        assert stats["total"] == list_data["total"], \
            f"Stats total ({stats['total']}) doesn't match list total ({list_data['total']})"
