"""
Test suite for TGME Workspace - ServiceBook API
Tests cover: Auth, Employees, Clients, Locations, Contacts, Parts, Tasks,
Service Entries, Billing, Parts Requests, Expenses, Dashboard
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://content-gen-preview-3.preview.emergentagent.com')
BASE_URL = BASE_URL.rstrip('/')

# Test data storage
test_data = {}


class TestSetup:
    """Setup and initialization tests"""

    def test_setup_endpoint(self):
        """POST /api/workspace/setup - Should create default admin or return already setup"""
        response = requests.post(f"{BASE_URL}/api/workspace/setup")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # Should say "Setup already completed" or "Setup completed"
        assert "completed" in data["message"].lower()
        print(f"Setup response: {data}")


class TestAuth:
    """Authentication endpoint tests"""

    def test_login_success(self):
        """POST /api/workspace/auth/login - Valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/workspace/auth/login",
            json={"employee_id": "ADMIN001", "password": "admin123", "section": "servicebook"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "employee" in data
        assert data["employee"]["employee_id"] == "ADMIN001"
        assert data["employee"]["role"] == "admin"
        assert data["section"] == "servicebook"
        # Store token for other tests
        test_data["token"] = data["token"]
        print(f"Login successful: {data['employee']['name']}")

    def test_login_invalid_password(self):
        """POST /api/workspace/auth/login - Invalid password"""
        response = requests.post(
            f"{BASE_URL}/api/workspace/auth/login",
            json={"employee_id": "ADMIN001", "password": "wrongpass", "section": "servicebook"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_login_invalid_employee(self):
        """POST /api/workspace/auth/login - Non-existent employee"""
        response = requests.post(
            f"{BASE_URL}/api/workspace/auth/login",
            json={"employee_id": "NOEXIST", "password": "admin123", "section": "servicebook"}
        )
        assert response.status_code == 401

    def test_verify_token(self):
        """GET /api/workspace/auth/verify - Valid token"""
        if "token" not in test_data:
            pytest.skip("No token available")
        response = requests.get(f"{BASE_URL}/api/workspace/auth/verify?token={test_data['token']}")
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["employee"]["employee_id"] == "ADMIN001"

    def test_verify_invalid_token(self):
        """GET /api/workspace/auth/verify - Invalid token"""
        response = requests.get(f"{BASE_URL}/api/workspace/auth/verify?token=invalidtoken123")
        assert response.status_code == 401


class TestEmployees:
    """Employee CRUD tests"""

    def test_get_employees(self):
        """GET /api/workspace/employees - List all employees"""
        response = requests.get(f"{BASE_URL}/api/workspace/employees")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least ADMIN001
        admin_found = any(emp["employee_id"] == "ADMIN001" for emp in data)
        assert admin_found, "ADMIN001 should exist in employees list"
        print(f"Found {len(data)} employees")

    def test_create_employee(self):
        """POST /api/workspace/employees - Create new employee"""
        response = requests.post(
            f"{BASE_URL}/api/workspace/employees",
            json={
                "employee_id": "TEST_EMP001",
                "name": "Test Engineer",
                "phone": "9876543210",
                "email": "test@example.com",
                "role": "engineer",
                "password": "testpass123",
                "apps_access": ["servicebook"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["employee_id"] == "TEST_EMP001"
        assert data["name"] == "Test Engineer"
        assert data["role"] == "engineer"
        assert "id" in data
        test_data["test_employee_id"] = data["employee_id"]
        print(f"Created employee: {data['employee_id']}")

    def test_create_duplicate_employee(self):
        """POST /api/workspace/employees - Duplicate employee ID should fail"""
        response = requests.post(
            f"{BASE_URL}/api/workspace/employees",
            json={
                "employee_id": "ADMIN001",
                "name": "Duplicate Admin",
                "phone": "1234567890",
                "role": "admin",
                "password": "test123",
                "apps_access": ["servicebook"]
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "already exists" in data["detail"].lower()

    def test_get_employee_by_id(self):
        """GET /api/workspace/employees/{employee_id} - Get specific employee"""
        response = requests.get(f"{BASE_URL}/api/workspace/employees/ADMIN001")
        assert response.status_code == 200
        data = response.json()
        assert data["employee_id"] == "ADMIN001"


class TestClients:
    """Client CRUD tests"""

    def test_get_clients_empty(self):
        """GET /api/workspace/clients - List all clients (may be empty initially)"""
        response = requests.get(f"{BASE_URL}/api/workspace/clients")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} clients")

    def test_create_client(self):
        """POST /api/workspace/clients - Create new client"""
        response = requests.post(
            f"{BASE_URL}/api/workspace/clients",
            json={
                "company_name": "TEST_Acme Corp",
                "gst_number": "27AABCU9603R1ZM",
                "industry": "Technology",
                "notes": "Test client for automated testing"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["company_name"] == "TEST_Acme Corp"
        assert data["gst_number"] == "27AABCU9603R1ZM"
        assert "id" in data
        assert "qr_code" in data  # QR code should be auto-generated
        test_data["client_id"] = data["id"]
        print(f"Created client: {data['company_name']} with ID: {data['id']}")

    def test_get_client_detail(self):
        """GET /api/workspace/clients/{client_id} - Get client with locations/contacts"""
        if "client_id" not in test_data:
            pytest.skip("No test client created")
        response = requests.get(f"{BASE_URL}/api/workspace/clients/{test_data['client_id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_data["client_id"]
        assert "locations" in data
        assert "contacts" in data
        assert isinstance(data["locations"], list)
        assert isinstance(data["contacts"], list)


class TestLocations:
    """Client location tests"""

    def test_create_location(self):
        """POST /api/workspace/locations - Add location to client"""
        if "client_id" not in test_data:
            pytest.skip("No test client created")
        response = requests.post(
            f"{BASE_URL}/api/workspace/locations",
            json={
                "client_id": test_data["client_id"],
                "location_name": "Head Office",
                "address": "123 Test Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["location_name"] == "Head Office"
        assert data["city"] == "Mumbai"
        assert "id" in data
        test_data["location_id"] = data["id"]
        print(f"Created location: {data['location_name']}")

    def test_get_client_locations(self):
        """GET /api/workspace/clients/{client_id}/locations - Get client locations"""
        if "client_id" not in test_data:
            pytest.skip("No test client created")
        response = requests.get(f"{BASE_URL}/api/workspace/clients/{test_data['client_id']}/locations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify our created location is in the list
        location_found = any(loc["location_name"] == "Head Office" for loc in data)
        assert location_found


class TestContacts:
    """Client contact tests"""

    def test_create_contact(self):
        """POST /api/workspace/contacts - Add contact to client"""
        if "client_id" not in test_data:
            pytest.skip("No test client created")
        response = requests.post(
            f"{BASE_URL}/api/workspace/contacts",
            json={
                "client_id": test_data["client_id"],
                "name": "John Doe",
                "designation": "IT Manager",
                "phone": "9876543210",
                "email": "john@acme.com",
                "whatsapp": "9876543210",
                "is_primary": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["is_primary"] == True
        assert "id" in data
        test_data["contact_id"] = data["id"]
        print(f"Created contact: {data['name']}")

    def test_get_client_contacts(self):
        """GET /api/workspace/clients/{client_id}/contacts - Get client contacts"""
        if "client_id" not in test_data:
            pytest.skip("No test client created")
        response = requests.get(f"{BASE_URL}/api/workspace/clients/{test_data['client_id']}/contacts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


class TestParts:
    """Parts/Materials CRUD tests"""

    def test_get_parts_empty(self):
        """GET /api/workspace/parts - List all parts"""
        response = requests.get(f"{BASE_URL}/api/workspace/parts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} parts")

    def test_create_part(self):
        """POST /api/workspace/parts - Create new part"""
        response = requests.post(
            f"{BASE_URL}/api/workspace/parts",
            json={
                "name": "TEST_RAM 8GB DDR4",
                "sku": "TEST-RAM-8GB-DDR4",
                "category": "RAM",
                "unit": "pcs",
                "stock_qty": 25,
                "min_stock": 5,
                "price": 2500.00
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_RAM 8GB DDR4"
        assert data["sku"] == "TEST-RAM-8GB-DDR4"
        assert data["stock_qty"] == 25
        assert "id" in data
        test_data["part_id"] = data["id"]
        print(f"Created part: {data['name']}")

    def test_get_parts_verify_created(self):
        """GET /api/workspace/parts - Verify part was created"""
        response = requests.get(f"{BASE_URL}/api/workspace/parts")
        assert response.status_code == 200
        data = response.json()
        part_found = any(p["name"] == "TEST_RAM 8GB DDR4" for p in data)
        assert part_found, "Created part should appear in list"


class TestTasks:
    """Task management tests"""

    def test_get_tasks_empty(self):
        """GET /api/workspace/tasks - List all tasks"""
        response = requests.get(f"{BASE_URL}/api/workspace/tasks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} tasks")

    def test_create_task(self):
        """POST /api/workspace/tasks - Create new task"""
        if "client_id" not in test_data or "location_id" not in test_data:
            pytest.skip("No test client/location created")
        response = requests.post(
            f"{BASE_URL}/api/workspace/tasks",
            json={
                "client_id": test_data["client_id"],
                "location_id": test_data["location_id"],
                "assigned_to": "ADMIN001",
                "service_type": "service",
                "title": "TEST_System Maintenance Check",
                "description": "Routine maintenance for test",
                "priority": "medium",
                "created_by": "ADMIN001"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_System Maintenance Check"
        assert data["status"] == "assigned"  # Because assigned_to is set
        assert "id" in data
        test_data["task_id"] = data["id"]
        print(f"Created task: {data['title']}")

    def test_get_tasks_verify_created(self):
        """GET /api/workspace/tasks - Verify task was created"""
        response = requests.get(f"{BASE_URL}/api/workspace/tasks")
        assert response.status_code == 200
        data = response.json()
        task_found = any(t["title"] == "TEST_System Maintenance Check" for t in data)
        assert task_found, "Created task should appear in list"
        # Verify populated fields
        for task in data:
            if task["title"] == "TEST_System Maintenance Check":
                assert task.get("client_name") is not None
                assert task.get("assigned_to_name") is not None
                print(f"Task has client_name: {task['client_name']}, assigned_to: {task['assigned_to_name']}")

    def test_update_task_status(self):
        """PUT /api/workspace/tasks/{task_id} - Update task status"""
        if "task_id" not in test_data:
            pytest.skip("No test task created")
        response = requests.put(
            f"{BASE_URL}/api/workspace/tasks/{test_data['task_id']}",
            json={"status": "in_progress"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Task updated"

    def test_verify_task_status_updated(self):
        """GET /api/workspace/tasks - Verify task status was updated"""
        if "task_id" not in test_data:
            pytest.skip("No test task created")
        response = requests.get(f"{BASE_URL}/api/workspace/tasks")
        assert response.status_code == 200
        data = response.json()
        for task in data:
            if task["id"] == test_data["task_id"]:
                assert task["status"] == "in_progress"
                break


class TestServiceEntries:
    """Service entries tests"""

    def test_get_service_entries_empty(self):
        """GET /api/workspace/service-entries - List service entries"""
        response = requests.get(f"{BASE_URL}/api/workspace/service-entries")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} service entries")

    def test_get_pending_billing_empty(self):
        """GET /api/workspace/service-entries/pending-billing - Get unbilled entries"""
        response = requests.get(f"{BASE_URL}/api/workspace/service-entries/pending-billing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestPartsRequests:
    """Parts requests tests"""

    def test_get_parts_requests_empty(self):
        """GET /api/workspace/parts-requests - List parts requests"""
        response = requests.get(f"{BASE_URL}/api/workspace/parts-requests")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} parts requests")


class TestExpenses:
    """Expenses tests"""

    def test_get_expenses_empty(self):
        """GET /api/workspace/expenses - List expenses"""
        response = requests.get(f"{BASE_URL}/api/workspace/expenses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} expenses")


class TestDashboard:
    """Dashboard stats tests"""

    def test_get_dashboard_stats(self):
        """GET /api/workspace/dashboard/stats - Get dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/workspace/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        # Verify all expected stats are present
        assert "total_clients" in data
        assert "total_employees" in data
        assert "pending_tasks" in data
        assert "in_progress_tasks" in data
        assert "completed_today" in data
        assert "pending_billing" in data
        assert "pending_parts_requests" in data
        assert "pending_expenses" in data
        print(f"Dashboard stats: {data}")


class TestCleanup:
    """Cleanup test data"""

    def test_logout(self):
        """POST /api/workspace/auth/logout - Logout"""
        if "token" not in test_data:
            pytest.skip("No token to logout")
        response = requests.post(f"{BASE_URL}/api/workspace/auth/logout?token={test_data['token']}")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Logged out successfully"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
