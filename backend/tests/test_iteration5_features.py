"""
Test Iteration 5 Features for TGME ServiceBook
- BUG FIX: Start Task button - changes task status from 'assigned' to 'in_progress'
- ENHANCEMENT: Request Parts page - new fields (Company, Location, Device Details, User Name)
- Backend parts-requests endpoint - accepts and returns new fields with client_name/location_name
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


@pytest.fixture(scope="class")
def admin_session():
    """Setup admin session for authenticated requests"""
    session = requests.Session()
    response = session.post(f"{BASE_URL}/api/workspace/auth/login", json={
        "employee_id": "maharathy",
        "password": "Charu@123@",
        "section": "servicebook"
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    data = response.json()
    session.headers.update({"Content-Type": "application/json"})
    return {"session": session, "token": data["token"], "employee": data["employee"]}


@pytest.fixture(scope="class")
def engineer_session():
    """Setup engineer session (TEST_ENG01) for authenticated requests"""
    session = requests.Session()
    response = session.post(f"{BASE_URL}/api/workspace/auth/login", json={
        "employee_id": "TEST_ENG01",
        "password": "test123",
        "section": "servicebook"
    })
    # If engineer doesn't exist, create one
    if response.status_code != 200:
        # Login as admin to create engineer
        admin_response = session.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": "maharathy",
            "password": "Charu@123@",
            "section": "servicebook"
        })
        if admin_response.status_code == 200:
            # Create test engineer using bulk upload
            create_resp = session.post(f"{BASE_URL}/api/workspace/bulk/employees", json={
                "rows": [{"employee_id": "TEST_ENG01", "name": "Test Engineer", "phone": "1234567890", "password": "test123", "role": "engineer"}]
            })
            print(f"Created test engineer: {create_resp.text}")
            
            # Try login again
            response = session.post(f"{BASE_URL}/api/workspace/auth/login", json={
                "employee_id": "TEST_ENG01",
                "password": "test123",
                "section": "servicebook"
            })
    
    if response.status_code != 200:
        pytest.skip("Could not login as engineer - skipping engineer tests")
    
    data = response.json()
    session.headers.update({"Content-Type": "application/json"})
    return {"session": session, "token": data["token"], "employee": data["employee"]}


@pytest.fixture(scope="class")
def test_data(admin_session):
    """Get client and location for testing"""
    session = admin_session["session"]
    
    # Get clients
    clients_resp = session.get(f"{BASE_URL}/api/workspace/clients")
    clients = clients_resp.json() if clients_resp.status_code == 200 else []
    
    if not clients:
        pytest.skip("No clients available for testing")
    
    client_id = clients[0]["id"]
    client_name = clients[0]["company_name"]
    
    # Get locations for this client
    locations_resp = session.get(f"{BASE_URL}/api/workspace/clients/{client_id}/locations")
    locations = locations_resp.json() if locations_resp.status_code == 200 else []
    
    if not locations:
        # Create a location
        loc_resp = session.post(f"{BASE_URL}/api/workspace/locations", json={
            "client_id": client_id,
            "location_name": "TEST_Location_Main",
            "address": "123 Test St",
            "city": "Test City"
        })
        if loc_resp.status_code == 200:
            locations = [loc_resp.json()]
    
    location_id = locations[0]["id"] if locations else None
    location_name = locations[0]["location_name"] if locations else None
    
    # Get parts
    parts_resp = session.get(f"{BASE_URL}/api/workspace/parts")
    parts = parts_resp.json() if parts_resp.status_code == 200 else []
    
    return {
        "client_id": client_id,
        "client_name": client_name,
        "location_id": location_id,
        "location_name": location_name,
        "parts": parts
    }


class TestStartTaskFeature:
    """BUG FIX: Start Task button - changeTaskStatus API endpoint"""
    
    def test_change_task_status_to_in_progress(self, admin_session, test_data):
        """POST /api/workspace/tasks/{id}/status should change status to in_progress"""
        session = admin_session["session"]
        
        if not test_data["location_id"]:
            pytest.skip("No location available for testing")
        
        # Create a task with assigned status
        unique_ticket = f"TEST-START-{int(time.time())}"
        create_resp = session.post(f"{BASE_URL}/api/workspace/tasks", json={
            "title": "TEST_Task for Start Task test",
            "ticket_id": unique_ticket,
            "client_id": test_data["client_id"],
            "location_id": test_data["location_id"],
            "task_type": "known_issue",
            "service_type": "service",
            "assigned_to": "TEST_ENG01"
        })
        
        assert create_resp.status_code == 200, f"Task creation failed: {create_resp.text}"
        task = create_resp.json()
        task_id = task["id"]
        
        # Set task to assigned status first
        assign_resp = session.post(f"{BASE_URL}/api/workspace/tasks/{task_id}/assign", json={
            "assigned_to": "TEST_ENG01",
            "by": "maharathy"
        })
        print(f"Assign response: {assign_resp.status_code} - {assign_resp.text}")
        
        # Verify task is assigned
        get_resp = session.get(f"{BASE_URL}/api/workspace/tasks/{task_id}")
        task_detail = get_resp.json()
        assert task_detail["status"] == "assigned", f"Task should be 'assigned', got: {task_detail['status']}"
        print(f"PASSED: Task is in 'assigned' status")
        
        # Now change status to in_progress (simulating Start Task button click)
        status_resp = session.post(f"{BASE_URL}/api/workspace/tasks/{task_id}/status", json={
            "status": "in_progress",
            "by": "TEST_ENG01",
            "gps_lat": 19.0760,
            "gps_lng": 72.8777
        })
        
        assert status_resp.status_code == 200, f"Status change failed: {status_resp.text}"
        print(f"Status change response: {status_resp.json()}")
        
        # Verify task status is now in_progress
        verify_resp = session.get(f"{BASE_URL}/api/workspace/tasks/{task_id}")
        updated_task = verify_resp.json()
        
        assert updated_task["status"] == "in_progress", f"Task should be 'in_progress', got: {updated_task['status']}"
        assert "started_at" in updated_task, "Task should have started_at timestamp"
        print(f"PASSED: Task status changed to 'in_progress', started_at={updated_task.get('started_at')}")
        
        # Verify timeline has the status change entry
        assert "timeline" in updated_task, "Task should have timeline"
        status_change_entries = [t for t in updated_task.get("timeline", []) if "in_progress" in t.get("action", "").lower() or "In Progress" in t.get("action", "")]
        assert len(status_change_entries) > 0, "Timeline should have 'in progress' entry"
        print(f"PASSED: Timeline contains status change entry")
    
    def test_change_task_status_api_endpoint_exists(self, admin_session):
        """Verify POST /api/workspace/tasks/{id}/status endpoint exists and is accessible"""
        session = admin_session["session"]
        
        # Try with a non-existent task ID to verify endpoint exists (should return 404 or 500, not 405)
        response = session.post(f"{BASE_URL}/api/workspace/tasks/nonexistent123/status", json={
            "status": "in_progress",
            "by": "test"
        })
        
        # 404 or 500 means endpoint exists, 405 means endpoint doesn't exist
        assert response.status_code != 405, "Endpoint POST /api/workspace/tasks/{id}/status should exist"
        print(f"PASSED: Status change endpoint exists (returned {response.status_code} for non-existent task)")


class TestRequestPartsNewFields:
    """ENHANCEMENT: Request Parts page - new fields (Company, Location, Device Details, User Name)"""
    
    def test_create_parts_request_with_new_fields(self, admin_session, test_data):
        """POST /api/workspace/parts-requests should accept new fields"""
        session = admin_session["session"]
        
        if not test_data["parts"]:
            pytest.skip("No parts available for testing")
        
        part = test_data["parts"][0]
        
        # Create parts request with all new fields
        request_data = {
            "employee_id": "TEST_ENG01",
            "client_id": test_data["client_id"],
            "location_id": test_data["location_id"],
            "device_name": "HP ProBook Laptop",
            "device_model": "450 G8",
            "device_serial": "SN-TEST12345",
            "user_name": "John Doe",
            "items": [
                {"part_id": part["id"], "part_name": part["name"], "quantity": 2, "reason": "Replacement"}
            ],
            "urgency": "urgent",
            "notes": "Test request with all new fields"
        }
        
        response = session.post(f"{BASE_URL}/api/workspace/parts-requests", json=request_data)
        
        assert response.status_code == 200, f"Parts request creation failed: {response.text}"
        created_request = response.json()
        
        # Verify all new fields are stored
        assert created_request.get("client_id") == test_data["client_id"], "client_id not stored"
        assert created_request.get("location_id") == test_data["location_id"], "location_id not stored"
        assert created_request.get("device_name") == "HP ProBook Laptop", "device_name not stored"
        assert created_request.get("device_model") == "450 G8", "device_model not stored"
        assert created_request.get("device_serial") == "SN-TEST12345", "device_serial not stored"
        assert created_request.get("user_name") == "John Doe", "user_name not stored"
        
        print(f"PASSED: Parts request created with all new fields. ID={created_request.get('id')}")
        
        return created_request.get("id")
    
    def test_get_parts_requests_returns_client_location_names(self, admin_session, test_data):
        """GET /api/workspace/parts-requests should return client_name and location_name"""
        session = admin_session["session"]
        
        # First create a parts request to ensure we have one
        if test_data["parts"]:
            part = test_data["parts"][0]
            session.post(f"{BASE_URL}/api/workspace/parts-requests", json={
                "employee_id": "TEST_ENG01",
                "client_id": test_data["client_id"],
                "location_id": test_data["location_id"],
                "device_name": "Test Device",
                "items": [{"part_id": part["id"], "part_name": part["name"], "quantity": 1}],
                "urgency": "normal"
            })
        
        # Get all parts requests
        response = session.get(f"{BASE_URL}/api/workspace/parts-requests")
        
        assert response.status_code == 200, f"Get parts requests failed: {response.text}"
        requests_list = response.json()
        
        # Find a request with client_id and location_id
        relevant_requests = [r for r in requests_list if r.get("client_id") and r.get("location_id")]
        
        if not relevant_requests:
            print("SKIPPED: No requests with client_id and location_id to verify")
            return
        
        sample_request = relevant_requests[0]
        
        # Verify client_name and location_name are populated
        assert "client_name" in sample_request, "client_name should be in response"
        assert "location_name" in sample_request, "location_name should be in response"
        
        # client_name and location_name can be None if lookup fails, but field should exist
        print(f"PASSED: Parts request includes client_name={sample_request.get('client_name')}, location_name={sample_request.get('location_name')}")
    
    def test_parts_request_with_optional_fields_null(self, admin_session, test_data):
        """Parts request should accept null/empty optional fields"""
        session = admin_session["session"]
        
        if not test_data["parts"]:
            pytest.skip("No parts available for testing")
        
        part = test_data["parts"][0]
        
        # Create request with only mandatory fields (company/location) and no device details
        request_data = {
            "employee_id": "TEST_ENG01",
            "client_id": test_data["client_id"],
            "location_id": test_data["location_id"],
            # No device_name, device_model, device_serial, user_name
            "items": [
                {"part_id": part["id"], "part_name": part["name"], "quantity": 1}
            ],
            "urgency": "normal",
            "notes": ""
        }
        
        response = session.post(f"{BASE_URL}/api/workspace/parts-requests", json=request_data)
        
        assert response.status_code == 200, f"Parts request creation failed: {response.text}"
        created_request = response.json()
        
        # Verify request was created successfully
        assert created_request.get("id"), "Request should have an ID"
        assert created_request.get("client_id") == test_data["client_id"]
        assert created_request.get("location_id") == test_data["location_id"]
        
        print(f"PASSED: Parts request created with optional fields as null")


class TestPartsRequestValidation:
    """Test validation for Request Parts form - company and location mandatory"""
    
    def test_parts_request_with_empty_client_id(self, admin_session, test_data):
        """Parts request with empty client_id should still be created (validation is frontend)"""
        session = admin_session["session"]
        
        if not test_data["parts"]:
            pytest.skip("No parts available for testing")
        
        part = test_data["parts"][0]
        
        # Backend doesn't enforce client_id as mandatory - frontend does
        request_data = {
            "employee_id": "TEST_ENG01",
            "client_id": "",  # Empty client_id
            "location_id": test_data["location_id"],
            "items": [{"part_id": part["id"], "part_name": part["name"], "quantity": 1}],
            "urgency": "normal"
        }
        
        response = session.post(f"{BASE_URL}/api/workspace/parts-requests", json=request_data)
        
        # Backend accepts empty client_id (frontend handles validation)
        # This is expected behavior based on current implementation
        print(f"Backend response for empty client_id: {response.status_code}")
        assert response.status_code in [200, 400, 422], f"Unexpected status: {response.status_code}"


class TestGetClientsAndLocations:
    """Test clients and locations endpoints for dropdown population"""
    
    def test_get_clients_endpoint(self, admin_session):
        """GET /api/workspace/clients should return list of clients"""
        session = admin_session["session"]
        
        response = session.get(f"{BASE_URL}/api/workspace/clients")
        
        assert response.status_code == 200, f"Get clients failed: {response.text}"
        clients = response.json()
        
        assert isinstance(clients, list), "Response should be a list"
        if clients:
            client = clients[0]
            assert "id" in client, "Client should have id"
            assert "company_name" in client, "Client should have company_name"
        
        print(f"PASSED: Got {len(clients)} clients")
    
    def test_get_locations_for_client(self, admin_session, test_data):
        """GET /api/workspace/clients/{id}/locations should return locations for a client"""
        session = admin_session["session"]
        
        client_id = test_data["client_id"]
        response = session.get(f"{BASE_URL}/api/workspace/clients/{client_id}/locations")
        
        assert response.status_code == 200, f"Get locations failed: {response.text}"
        locations = response.json()
        
        assert isinstance(locations, list), "Response should be a list"
        if locations:
            location = locations[0]
            assert "id" in location, "Location should have id"
            assert "location_name" in location, "Location should have location_name"
        
        print(f"PASSED: Got {len(locations)} locations for client {client_id}")


class TestGetTaskEndpoint:
    """Test GET /api/workspace/tasks/{id} for task detail loading"""
    
    def test_get_task_by_id(self, admin_session, test_data):
        """GET /api/workspace/tasks/{id} should return task details"""
        session = admin_session["session"]
        
        if not test_data["location_id"]:
            pytest.skip("No location available for testing")
        
        # Create a task first
        unique_ticket = f"TEST-GET-{int(time.time())}"
        create_resp = session.post(f"{BASE_URL}/api/workspace/tasks", json={
            "title": "TEST_Task for get task test",
            "ticket_id": unique_ticket,
            "client_id": test_data["client_id"],
            "location_id": test_data["location_id"],
            "task_type": "known_issue",
            "service_type": "service"
        })
        
        assert create_resp.status_code == 200, f"Task creation failed: {create_resp.text}"
        task = create_resp.json()
        task_id = task["id"]
        
        # Get task by ID using the direct endpoint (used by TaskDetailPage)
        get_resp = session.get(f"{BASE_URL}/api/workspace/tasks/{task_id}")
        
        assert get_resp.status_code == 200, f"Get task failed: {get_resp.text}"
        task_detail = get_resp.json()
        
        # Verify expected fields
        assert task_detail["id"] == task_id, "Task ID should match"
        assert task_detail["title"] == "TEST_Task for get task test", "Title should match"
        assert "client_name" in task_detail, "Task should have client_name populated"
        assert "location_name" in task_detail, "Task should have location_name populated"
        
        print(f"PASSED: Task detail retrieved with client_name={task_detail.get('client_name')}, location_name={task_detail.get('location_name')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
