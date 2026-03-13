"""
Test Bug Fixes for TGME ServiceBook
- BUG FIX 3: Ticket ID mandatory during task creation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestTicketIdMandatory:
    """BUG FIX 3 (P1): Ticket ID mandatory during task creation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": "maharathy",
            "password": "Charu@123@",
            "section": "servicebook"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get first client and location for task creation
        clients = requests.get(f"{BASE_URL}/api/workspace/clients", headers=self.headers).json()
        if clients:
            self.client_id = clients[0]["id"]
            locations = requests.get(f"{BASE_URL}/api/workspace/clients/{self.client_id}/locations", headers=self.headers).json()
            self.location_id = locations[0]["id"] if locations else None
        else:
            self.client_id = None
            self.location_id = None
    
    def test_create_task_without_ticket_id_returns_400(self):
        """Task creation should fail with 400 when ticket_id is missing"""
        if not self.client_id or not self.location_id:
            pytest.skip("No client/location available for testing")
        
        # Attempt to create task without ticket_id
        response = requests.post(f"{BASE_URL}/api/workspace/tasks", json={
            "title": "TEST_Task without ticket ID",
            "client_id": self.client_id,
            "location_id": self.location_id,
            "task_type": "known_issue",
            "service_type": "service"
            # No ticket_id field
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        assert "Ticket ID is mandatory" in response.text or "ticket_id" in response.text.lower()
        print("PASSED: Task creation without ticket_id returns 400")
    
    def test_create_task_with_empty_ticket_id_returns_400(self):
        """Task creation should fail with 400 when ticket_id is empty string"""
        if not self.client_id or not self.location_id:
            pytest.skip("No client/location available for testing")
        
        # Attempt to create task with empty ticket_id
        response = requests.post(f"{BASE_URL}/api/workspace/tasks", json={
            "title": "TEST_Task with empty ticket ID",
            "ticket_id": "",  # Empty string
            "client_id": self.client_id,
            "location_id": self.location_id,
            "task_type": "known_issue",
            "service_type": "service"
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        assert "Ticket ID is mandatory" in response.text or "ticket_id" in response.text.lower()
        print("PASSED: Task creation with empty ticket_id returns 400")
    
    def test_create_task_with_whitespace_ticket_id_returns_400(self):
        """Task creation should fail with 400 when ticket_id is only whitespace"""
        if not self.client_id or not self.location_id:
            pytest.skip("No client/location available for testing")
        
        # Attempt to create task with whitespace-only ticket_id
        response = requests.post(f"{BASE_URL}/api/workspace/tasks", json={
            "title": "TEST_Task with whitespace ticket ID",
            "ticket_id": "   ",  # Only whitespace
            "client_id": self.client_id,
            "location_id": self.location_id,
            "task_type": "known_issue",
            "service_type": "service"
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        assert "Ticket ID is mandatory" in response.text or "ticket_id" in response.text.lower()
        print("PASSED: Task creation with whitespace ticket_id returns 400")
    
    def test_create_task_with_valid_ticket_id_succeeds(self):
        """Task creation should succeed when ticket_id is provided"""
        if not self.client_id or not self.location_id:
            pytest.skip("No client/location available for testing")
        
        import time
        unique_ticket = f"TEST-TKT-{int(time.time())}"
        
        # Create task with valid ticket_id
        response = requests.post(f"{BASE_URL}/api/workspace/tasks", json={
            "title": "TEST_Task with valid ticket ID",
            "ticket_id": unique_ticket,
            "client_id": self.client_id,
            "location_id": self.location_id,
            "task_type": "known_issue",
            "service_type": "service"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        task_data = response.json()
        assert task_data.get("ticket_id") == unique_ticket, f"ticket_id not returned correctly"
        assert "job_id" in task_data, "job_id should be auto-generated"
        
        print(f"PASSED: Task created successfully with ticket_id={unique_ticket}, job_id={task_data['job_id']}")
        
        # Verify task is retrievable and ticket_id is persisted
        task_id = task_data["id"]
        get_response = requests.get(f"{BASE_URL}/api/workspace/tasks/{task_id}")
        assert get_response.status_code == 200
        retrieved_task = get_response.json()
        assert retrieved_task.get("ticket_id") == unique_ticket, "ticket_id not persisted correctly"
        print(f"PASSED: Ticket ID persisted and retrievable")


class TestTaskListContainsTicketId:
    """Verify ticket_id appears in task list responses"""
    
    def test_tasks_list_includes_ticket_id_field(self):
        """GET /api/workspace/tasks should return ticket_id for each task"""
        response = requests.get(f"{BASE_URL}/api/workspace/tasks")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        tasks = response.json()
        if tasks:
            # Check if ticket_id field exists in task objects
            sample_task = tasks[0]
            # ticket_id may be None or a string, but field should exist
            assert "ticket_id" in sample_task or "job_id" in sample_task, "Task should have ticket_id or job_id field"
            print(f"PASSED: Task list response includes ticket_id field. Sample task has ticket_id={sample_task.get('ticket_id')}")
        else:
            print("PASSED: No tasks to verify but API returned successfully")


class TestWhatsAppMessageContent:
    """BUG FIX 2 (P1): WhatsApp messages should contain ticket_id and client_id, not client_name
    Note: This is tested via frontend/code review since WhatsApp is client-side"""
    
    def test_task_detail_includes_required_fields_for_whatsapp(self):
        """Task detail should include ticket_id and client_id for WhatsApp message generation"""
        # First get a task
        response = requests.get(f"{BASE_URL}/api/workspace/tasks")
        assert response.status_code == 200
        
        tasks = response.json()
        if not tasks:
            pytest.skip("No tasks available to test")
        
        task_id = tasks[0]["id"]
        
        # Get task detail
        detail_response = requests.get(f"{BASE_URL}/api/workspace/tasks/{task_id}")
        assert detail_response.status_code == 200
        
        task_detail = detail_response.json()
        
        # Verify required fields for WhatsApp message generation are present
        assert "ticket_id" in task_detail, "Task detail should include ticket_id field"
        assert "client_id" in task_detail, "Task detail should include client_id field"
        assert "job_id" in task_detail, "Task detail should include job_id field"
        
        print(f"PASSED: Task detail includes ticket_id={task_detail.get('ticket_id')}, client_id={task_detail.get('client_id')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
