"""
Admin Centre API Tests - Employee Management with Permissions
Tests for:
- Admin employee endpoints (GET, DELETE)
- Employee CRUD with permissions
- Login with permissions field
- Manual lead creation
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMPLOYEE_ID = "maharathy"
ADMIN_PASSWORD = "Charu@123@"


class TestAdminLogin:
    """Test login with Admin Centre and permissions"""
    
    def test_login_admin_centre(self):
        """Login with Admin Centre selected should return permissions"""
        response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": ADMIN_EMPLOYEE_ID,
            "password": ADMIN_PASSWORD,
            "section": "admin"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Verify token returned
        assert "token" in data, "Token not returned"
        assert len(data["token"]) > 0, "Token is empty"
        
        # Verify employee object
        assert "employee" in data, "Employee object not returned"
        emp = data["employee"]
        assert emp["employee_id"] == ADMIN_EMPLOYEE_ID
        assert "permissions" in emp, "Permissions field not in employee object"
        assert "apps_access" in emp, "apps_access field not in employee object"
        assert "admin" in emp["apps_access"], "Admin not in apps_access"
        
        print(f"SUCCESS: Login returned permissions: {emp.get('permissions', {})}")
    
    def test_login_servicebook(self):
        """Login with ServiceBook selected"""
        response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": ADMIN_EMPLOYEE_ID,
            "password": ADMIN_PASSWORD,
            "section": "servicebook"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["section"] == "servicebook"
        print("SUCCESS: ServiceBook login works")
    
    def test_login_sales(self):
        """Login with Sales CRM selected"""
        response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": ADMIN_EMPLOYEE_ID,
            "password": ADMIN_PASSWORD,
            "section": "sales"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["section"] == "sales"
        print("SUCCESS: Sales CRM login works")
    
    def test_login_invalid_credentials(self):
        """Login with wrong password should fail"""
        response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": ADMIN_EMPLOYEE_ID,
            "password": "wrongpassword",
            "section": "admin"
        })
        assert response.status_code == 401, "Should return 401 for invalid credentials"
        print("SUCCESS: Invalid credentials rejected")


class TestAdminEmployees:
    """Test admin employee management endpoints"""
    
    def test_get_all_employees(self):
        """GET /api/workspace/admin/employees returns all employees with permissions"""
        response = requests.get(f"{BASE_URL}/api/workspace/admin/employees")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one employee"
        
        # Check first employee has required fields
        emp = data[0]
        required_fields = ["id", "employee_id", "name", "role", "is_active", "apps_access", "permissions"]
        for field in required_fields:
            assert field in emp, f"Missing field: {field}"
        
        print(f"SUCCESS: Got {len(data)} employees with permissions field")


class TestEmployeeCRUD:
    """Test employee CRUD with permissions - each test uses unique ID"""
    
    def test_create_employee_with_permissions(self):
        """Create employee with apps_access and permissions"""
        test_emp_id = f"test_emp_{uuid.uuid4().hex[:8]}"
        
        permissions = {
            "servicebook": {
                "clients": {"view": True, "create": True, "edit": True, "delete": False},
                "tasks": {"view": True, "create": True, "edit": True, "delete": True}
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/workspace/employees", json={
            "employee_id": test_emp_id,
            "name": "Test Employee",
            "phone": "9876543210",
            "email": "test@example.com",
            "role": "engineer",
            "password": "Test@123",
            "is_active": True,
            "apps_access": ["servicebook"],
            "permissions": permissions
        })
        
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        
        assert data["employee_id"] == test_emp_id
        assert data["name"] == "Test Employee"
        assert "servicebook" in data.get("apps_access", [])
        
        print(f"SUCCESS: Created employee {test_emp_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/workspace/admin/employees/{test_emp_id}")
    
    def test_create_and_verify_employee_in_list(self):
        """Create employee and verify it appears in admin list"""
        test_emp_id = f"test_emp_{uuid.uuid4().hex[:8]}"
        
        # Create employee
        response = requests.post(f"{BASE_URL}/api/workspace/employees", json={
            "employee_id": test_emp_id,
            "name": "Test Employee List",
            "phone": "9876543210",
            "role": "engineer",
            "password": "Test@123",
            "is_active": True,
            "apps_access": ["servicebook"]
        })
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        # Check the list
        response = requests.get(f"{BASE_URL}/api/workspace/admin/employees")
        assert response.status_code == 200
        data = response.json()
        
        found = False
        for emp in data:
            if emp["employee_id"] == test_emp_id:
                found = True
                assert "servicebook" in emp.get("apps_access", []), "ServiceBook not in apps_access"
                print(f"SUCCESS: Found test employee with apps_access: {emp.get('apps_access')}")
                break
        
        assert found, f"Test employee {test_emp_id} not found in list"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/workspace/admin/employees/{test_emp_id}")
    
    def test_update_employee_permissions(self):
        """Update employee to add Sales CRM access and modify permissions"""
        test_emp_id = f"test_emp_{uuid.uuid4().hex[:8]}"
        
        # Create employee first
        response = requests.post(f"{BASE_URL}/api/workspace/employees", json={
            "employee_id": test_emp_id,
            "name": "Test Employee Update",
            "phone": "9876543210",
            "role": "engineer",
            "password": "Test@123",
            "is_active": True,
            "apps_access": ["servicebook"]
        })
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        # Update with new permissions
        new_permissions = {
            "servicebook": {
                "clients": {"view": True, "create": True, "edit": True, "delete": False},
                "tasks": {"view": True, "create": True, "edit": True, "delete": True}
            },
            "sales": {
                "leads": {"view": True, "create": True, "edit": True, "delete": False}
            }
        }
        
        response = requests.put(f"{BASE_URL}/api/workspace/employees/{test_emp_id}", json={
            "apps_access": ["servicebook", "sales"],
            "permissions": new_permissions
        })
        
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        # Verify the update
        response = requests.get(f"{BASE_URL}/api/workspace/admin/employees")
        data = response.json()
        
        for emp in data:
            if emp["employee_id"] == test_emp_id:
                assert "sales" in emp.get("apps_access", []), "Sales not added to apps_access"
                assert "leads" in emp.get("permissions", {}).get("sales", {}), "Leads permission not set"
                print(f"SUCCESS: Updated employee with Sales CRM access")
                break
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/workspace/admin/employees/{test_emp_id}")
    
    def test_deactivate_employee(self):
        """DELETE /api/workspace/admin/employees/{id} deactivates employee"""
        test_emp_id = f"test_emp_{uuid.uuid4().hex[:8]}"
        
        # Create employee first
        response = requests.post(f"{BASE_URL}/api/workspace/employees", json={
            "employee_id": test_emp_id,
            "name": "Test Employee Deactivate",
            "phone": "9876543210",
            "role": "engineer",
            "password": "Test@123",
            "is_active": True,
            "apps_access": ["servicebook"]
        })
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        # Deactivate
        response = requests.delete(f"{BASE_URL}/api/workspace/admin/employees/{test_emp_id}")
        assert response.status_code == 200, f"Deactivate failed: {response.text}"
        
        # Verify deactivated
        response = requests.get(f"{BASE_URL}/api/workspace/admin/employees")
        data = response.json()
        
        for emp in data:
            if emp["employee_id"] == test_emp_id:
                assert emp["is_active"] == False, "Employee should be inactive"
                print(f"SUCCESS: Employee deactivated")
                break


class TestManualLeadCreation:
    """Test manual lead creation from Sales CRM"""
    
    def test_create_lead_manually(self):
        """POST /api/leads/manual/create creates a lead"""
        response = requests.post(f"{BASE_URL}/api/leads/manual/create", json={
            "name": "Test Lead Manual",
            "phone": "+919876543210",
            "email": "testlead@example.com",
            "company": "Test Company",
            "website": "https://test.com",
            "address": "Test Address",
            "business_type": "IT Services",
            "location": "Mumbai",
            "priority": "high",
            "lead_source": "manual",
            "amount": 50000,
            "notes": "Test lead created via API"
        })
        
        assert response.status_code == 200, f"Create lead failed: {response.text}"
        data = response.json()
        
        assert "id" in data, "Lead ID not returned"
        assert data["name"] == "Test Lead Manual"
        assert data["lead_source"] == "manual"
        assert data["amount"] == 50000
        
        print(f"SUCCESS: Created manual lead with ID: {data['id']}")
        
        # Cleanup - delete the test lead
        lead_id = data["id"]
        requests.delete(f"{BASE_URL}/api/leads/{lead_id}")
    
    def test_create_lead_name_required(self):
        """Create lead without name should fail"""
        response = requests.post(f"{BASE_URL}/api/leads/manual/create", json={
            "phone": "+919876543210",
            "company": "Test Company"
        })
        
        assert response.status_code == 422 or response.status_code == 400, "Should fail without name"
        print("SUCCESS: Lead creation requires name")


class TestDashboardStats:
    """Test dashboard stats endpoint"""
    
    def test_lead_dashboard_stats(self):
        """GET /api/leads/dashboard/stats returns stats"""
        response = requests.get(f"{BASE_URL}/api/leads/dashboard/stats")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        required_fields = ["total_leads", "new", "contacted", "converted", "today_visitors"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"SUCCESS: Dashboard stats - Total leads: {data['total_leads']}, New: {data['new']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
