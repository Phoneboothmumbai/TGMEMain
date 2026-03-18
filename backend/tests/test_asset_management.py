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


# ==================== PHASE 1 FEATURES - Dynamic Specs & Bulk Upload ====================

class TestAssetSpecsDeviceSpecific:
    """Test device-specific spec fields for various asset types (Phase 1 feature)"""
    
    created_cctv_id = None
    created_laptop_id = None
    created_router_id = None
    created_printer_id = None
    created_server_id = None
    created_switch_id = None
    
    def test_create_cctv_camera_with_specs(self, api_client):
        """POST /assets creates CCTV camera with device-specific specs"""
        payload = {
            "type": "cctv",
            "brand": "TEST_Hikvision",
            "model": "DS-2CD2143G2-IU",
            "serial_number": "TEST_CCTV001",
            "status": "active",
            "client_id": TEST_CLIENT_ID,
            "specs": {
                "camera_type": "Dome",
                "resolution": "4MP (2K)",
                "night_vision": "IR (Infrared)",
                "placement": "Indoor",
                "poe": "Yes",
                "ip_address": "192.168.1.64",
                "storage_device": "NVR Channel 1",
                "location_detail": "Main entrance lobby"
            },
            "notes": "Test CCTV with specs"
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 200, f"Create CCTV failed: {response.text}"
        
        data = response.json()
        assert data["type"] == "cctv"
        assert "specs" in data
        assert data["specs"]["camera_type"] == "Dome"
        assert data["specs"]["resolution"] == "4MP (2K)"
        assert data["specs"]["night_vision"] == "IR (Infrared)"
        assert data["specs"]["ip_address"] == "192.168.1.64"
        assert data["specs"]["location_detail"] == "Main entrance lobby"
        
        TestAssetSpecsDeviceSpecific.created_cctv_id = data["id"]
        print(f"Created CCTV asset: {data['asset_tag']} with specs")
    
    def test_create_laptop_with_specs(self, api_client):
        """POST /assets creates laptop with hardware specs"""
        payload = {
            "type": "laptop",
            "brand": "TEST_HP",
            "model": "ProBook 450 G9",
            "serial_number": "TEST_LAP001",
            "status": "active",
            "client_id": TEST_CLIENT_ID,
            "specs": {
                "processor": "Intel i5-1340P",
                "ram": "16GB DDR5",
                "storage": "512GB NVMe SSD",
                "os": "Windows 11 Pro",
                "screen_size": "15.6\"",
                "battery_health": "Good",
                "charger_type": "USB-C"
            },
            "notes": "Test laptop with full specs"
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 200, f"Create laptop failed: {response.text}"
        
        data = response.json()
        assert data["type"] == "laptop"
        assert data["specs"]["processor"] == "Intel i5-1340P"
        assert data["specs"]["ram"] == "16GB DDR5"
        assert data["specs"]["storage"] == "512GB NVMe SSD"
        assert data["specs"]["os"] == "Windows 11 Pro"
        
        TestAssetSpecsDeviceSpecific.created_laptop_id = data["id"]
        print(f"Created laptop asset: {data['asset_tag']} with specs")
    
    def test_create_router_with_specs(self, api_client):
        """POST /assets creates router with network specs"""
        payload = {
            "type": "router",
            "brand": "TEST_Cisco",
            "model": "RV340",
            "serial_number": "TEST_RTR001",
            "status": "active",
            "client_id": TEST_CLIENT_ID,
            "specs": {
                "wan_ports": "2x GbE WAN",
                "lan_ports": "4x GbE LAN",
                "wifi_standard": "No WiFi",
                "throughput": "900Mbps",
                "vpn_support": "Yes",
                "ip_address": "192.168.1.1",
                "isp": "Airtel Business"
            },
            "notes": "Test router with specs"
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 200, f"Create router failed: {response.text}"
        
        data = response.json()
        assert data["type"] == "router"
        assert data["specs"]["wan_ports"] == "2x GbE WAN"
        assert data["specs"]["lan_ports"] == "4x GbE LAN"
        assert data["specs"]["vpn_support"] == "Yes"
        
        TestAssetSpecsDeviceSpecific.created_router_id = data["id"]
        print(f"Created router asset: {data['asset_tag']} with specs")
    
    def test_create_printer_with_specs(self, api_client):
        """POST /assets creates printer with printer-specific specs"""
        payload = {
            "type": "printer",
            "brand": "TEST_HP",
            "model": "LaserJet Pro M404dn",
            "serial_number": "TEST_PRT001",
            "status": "active",
            "client_id": TEST_CLIENT_ID,
            "specs": {
                "printer_type": "Laser",
                "color_mode": "Mono (B&W)",
                "connectivity": "USB + Network (LAN)",
                "duplex": "Yes",
                "scanner": "No (Print Only)",
                "paper_size": "A4",
                "toner_cartridge": "HP 58A",
                "ip_address": "192.168.1.100"
            },
            "notes": "Test printer with specs"
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 200, f"Create printer failed: {response.text}"
        
        data = response.json()
        assert data["type"] == "printer"
        assert data["specs"]["printer_type"] == "Laser"
        assert data["specs"]["color_mode"] == "Mono (B&W)"
        assert data["specs"]["duplex"] == "Yes"
        
        TestAssetSpecsDeviceSpecific.created_printer_id = data["id"]
        print(f"Created printer asset: {data['asset_tag']} with specs")
    
    def test_create_server_with_specs(self, api_client):
        """POST /assets creates server with server-specific specs"""
        payload = {
            "type": "server",
            "brand": "TEST_Dell",
            "model": "PowerEdge R750",
            "serial_number": "TEST_SRV001",
            "status": "active",
            "client_id": TEST_CLIENT_ID,
            "specs": {
                "processor": "Intel Xeon Gold 5318Y x2",
                "ram": "128GB ECC DDR4",
                "storage": "4x 1.2TB SAS RAID-5",
                "raid_config": "RAID 5",
                "os": "Windows Server 2022",
                "rack_unit": "2U",
                "ip_address": "192.168.1.10",
                "roles": "AD, DNS, File Server",
                "remote_access": "iDRAC: 192.168.1.11"
            },
            "notes": "Test server with specs"
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 200, f"Create server failed: {response.text}"
        
        data = response.json()
        assert data["type"] == "server"
        assert data["specs"]["raid_config"] == "RAID 5"
        assert data["specs"]["os"] == "Windows Server 2022"
        assert data["specs"]["roles"] == "AD, DNS, File Server"
        
        TestAssetSpecsDeviceSpecific.created_server_id = data["id"]
        print(f"Created server asset: {data['asset_tag']} with specs")
    
    def test_create_switch_with_specs(self, api_client):
        """POST /assets creates network switch with switch-specific specs"""
        payload = {
            "type": "switch",
            "brand": "TEST_Cisco",
            "model": "CBS350-24P",
            "serial_number": "TEST_SW001",
            "status": "active",
            "client_id": TEST_CLIENT_ID,
            "specs": {
                "port_count": "24",
                "switch_type": "Managed",
                "speed": "1Gbps",
                "poe": "Yes (PoE+)",
                "poe_budget": "195W",
                "sfp_ports": "4x SFP",
                "ip_address": "192.168.1.2"
            },
            "notes": "Test switch with specs"
        }
        
        response = api_client.post(API_BASE, json=payload)
        assert response.status_code == 200, f"Create switch failed: {response.text}"
        
        data = response.json()
        assert data["type"] == "switch"
        assert data["specs"]["port_count"] == "24"
        assert data["specs"]["switch_type"] == "Managed"
        assert data["specs"]["poe"] == "Yes (PoE+)"
        
        TestAssetSpecsDeviceSpecific.created_switch_id = data["id"]
        print(f"Created switch asset: {data['asset_tag']} with specs")
    
    def test_get_cctv_asset_with_specs(self, api_client):
        """GET /assets/{id} returns CCTV with specs in response"""
        if not TestAssetSpecsDeviceSpecific.created_cctv_id:
            pytest.skip("No CCTV created")
        
        response = api_client.get(f"{API_BASE}/{TestAssetSpecsDeviceSpecific.created_cctv_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["type"] == "cctv"
        assert "specs" in data
        assert data["specs"]["camera_type"] == "Dome"
        assert data["specs"]["resolution"] == "4MP (2K)"
        assert "maintenance_history" in data  # Service history should be present
    
    def test_get_laptop_asset_with_specs(self, api_client):
        """GET /assets/{id} returns laptop with specs in response"""
        if not TestAssetSpecsDeviceSpecific.created_laptop_id:
            pytest.skip("No laptop created")
        
        response = api_client.get(f"{API_BASE}/{TestAssetSpecsDeviceSpecific.created_laptop_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["type"] == "laptop"
        assert "specs" in data
        assert data["specs"]["processor"] == "Intel i5-1340P"
        assert data["specs"]["ram"] == "16GB DDR5"
    
    def test_update_asset_specs(self, api_client):
        """PUT /assets/{id} can update specs field"""
        if not TestAssetSpecsDeviceSpecific.created_laptop_id:
            pytest.skip("No laptop created")
        
        # Update specs
        payload = {
            "specs": {
                "processor": "Intel i7-1360P",  # Upgraded
                "ram": "32GB DDR5",  # Upgraded
                "storage": "512GB NVMe SSD",
                "os": "Windows 11 Pro",
                "screen_size": "15.6\"",
                "battery_health": "Excellent",  # Changed
                "charger_type": "USB-C"
            }
        }
        
        response = api_client.put(f"{API_BASE}/{TestAssetSpecsDeviceSpecific.created_laptop_id}", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["specs"]["processor"] == "Intel i7-1360P"
        assert data["specs"]["ram"] == "32GB DDR5"
        assert data["specs"]["battery_health"] == "Excellent"
        
        # Verify persistence with GET
        get_response = api_client.get(f"{API_BASE}/{TestAssetSpecsDeviceSpecific.created_laptop_id}")
        get_data = get_response.json()
        assert get_data["specs"]["processor"] == "Intel i7-1360P"


class TestBulkUpload:
    """Test bulk CSV upload feature (Phase 1 feature)"""
    
    def test_bulk_upload_with_valid_data(self, api_client):
        """POST /assets/bulk creates multiple assets from CSV data"""
        payload = {
            "rows": [
                {
                    "client_name": "TEST_Acme Corp",
                    "location": "Head Office",
                    "type": "laptop",
                    "brand": "TEST_BulkLenovo",
                    "model": "ThinkPad T14",
                    "serial_number": "TEST_BULK001",
                    "status": "active",
                    "assigned_to": "Bulk User 1",
                    "specs": {
                        "processor": "AMD Ryzen 5 PRO",
                        "ram": "16GB",
                        "storage": "256GB"
                    }
                },
                {
                    "client_name": "TEST_Acme Corp",
                    "location": "Branch Office",
                    "type": "printer",
                    "brand": "TEST_BulkHP",
                    "model": "LaserJet Pro",
                    "serial_number": "TEST_BULK002",
                    "status": "active",
                    "specs": {
                        "printer_type": "Laser",
                        "color_mode": "Color"
                    }
                }
            ]
        }
        
        response = api_client.post(f"{API_BASE}/bulk", json=payload)
        assert response.status_code == 200, f"Bulk upload failed: {response.text}"
        
        data = response.json()
        assert "created" in data
        assert "errors" in data
        assert data["created"] == 2
        assert len(data["errors"]) == 0
        
        print(f"Bulk upload successful: {data['created']} assets created")
    
    def test_bulk_upload_with_invalid_client(self, api_client):
        """POST /assets/bulk reports errors for invalid clients"""
        payload = {
            "rows": [
                {
                    "client_name": "NonExistent Corp",
                    "type": "laptop",
                    "brand": "TEST_Invalid",
                    "model": "Model X",
                    "serial_number": "TEST_INVALID001",
                    "status": "active"
                }
            ]
        }
        
        response = api_client.post(f"{API_BASE}/bulk", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["created"] == 0
        assert len(data["errors"]) == 1
        assert "not found" in data["errors"][0].lower()
    
    def test_bulk_upload_with_empty_rows(self, api_client):
        """POST /assets/bulk with empty rows returns error"""
        payload = {"rows": []}
        
        response = api_client.post(f"{API_BASE}/bulk", json=payload)
        assert response.status_code == 400
    
    def test_bulk_upload_with_specs_preserved(self, api_client):
        """POST /assets/bulk preserves device-specific specs"""
        payload = {
            "rows": [
                {
                    "client_name": "TEST_Acme Corp",
                    "type": "cctv",
                    "brand": "TEST_BulkHikvision",
                    "model": "DS-2CD2143G2",
                    "serial_number": "TEST_BULKCCTV001",
                    "status": "active",
                    "specs": {
                        "camera_type": "Bullet",
                        "resolution": "8MP (4K)",
                        "night_vision": "Color Night Vision",
                        "poe": "Yes",
                        "ip_address": "192.168.1.70"
                    }
                }
            ]
        }
        
        response = api_client.post(f"{API_BASE}/bulk", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["created"] == 1
        
        # Verify specs were saved by searching for the asset
        search_response = api_client.get(f"{API_BASE}?search=TEST_BULKCCTV001")
        search_data = search_response.json()
        assert search_data["total"] >= 1
        
        asset = next((a for a in search_data["assets"] if a["serial_number"] == "TEST_BULKCCTV001"), None)
        assert asset is not None
        
        # Get full asset details to verify specs
        detail_response = api_client.get(f"{API_BASE}/{asset['id']}")
        detail_data = detail_response.json()
        assert detail_data["specs"]["camera_type"] == "Bullet"
        assert detail_data["specs"]["resolution"] == "8MP (4K)"


class TestCleanupPhase1Assets:
    """Clean up test assets created in Phase 1 tests"""
    
    def test_cleanup_spec_test_assets(self, api_client):
        """Delete all TEST_ prefixed assets created during Phase 1 tests"""
        # Search for all TEST_ assets
        response = api_client.get(f"{API_BASE}?search=TEST_&parent_only=false")
        assert response.status_code == 200
        
        data = response.json()
        deleted_count = 0
        
        for asset in data["assets"]:
            if "TEST_" in asset.get("brand", "") or "TEST_" in asset.get("serial_number", ""):
                # Only delete parent assets (accessories will cascade)
                if not asset.get("parent_asset_id"):
                    del_response = api_client.delete(f"{API_BASE}/{asset['id']}")
                    if del_response.status_code == 200:
                        deleted_count += 1
        
        print(f"Cleaned up {deleted_count} test assets")
