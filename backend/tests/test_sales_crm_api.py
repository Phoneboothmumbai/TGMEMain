"""
Sales CRM API Tests - Testing workspace auth with section-based access and leads APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMPLOYEE_ID = "maharathy"
TEST_PASSWORD = "Charu@123@"


class TestWorkspaceAuth:
    """Test workspace authentication with section-based access"""
    
    def test_login_with_sales_section(self):
        """Test login with Sales CRM section selected"""
        response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": TEST_EMPLOYEE_ID,
            "password": TEST_PASSWORD,
            "section": "sales"
        })
        print(f"Sales login response: {response.status_code} - {response.text[:200]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Token should be in response"
        assert "employee" in data, "Employee should be in response"
        assert data["section"] == "sales", f"Section should be 'sales', got {data['section']}"
        assert data["employee"]["employee_id"].lower() == TEST_EMPLOYEE_ID.lower()
        print(f"Sales login successful - token: {data['token'][:20]}...")
        return data["token"]
    
    def test_login_with_servicebook_section(self):
        """Test login with ServiceBook section selected"""
        response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": TEST_EMPLOYEE_ID,
            "password": TEST_PASSWORD,
            "section": "servicebook"
        })
        print(f"ServiceBook login response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["section"] == "servicebook", f"Section should be 'servicebook', got {data['section']}"
        print("ServiceBook login successful")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": "invalid_user",
            "password": "wrong_password",
            "section": "sales"
        })
        print(f"Invalid login response: {response.status_code}")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_verify_token(self):
        """Test token verification"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": TEST_EMPLOYEE_ID,
            "password": TEST_PASSWORD,
            "section": "sales"
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Verify token
        verify_response = requests.get(f"{BASE_URL}/api/workspace/auth/verify?token={token}")
        print(f"Verify token response: {verify_response.status_code}")
        assert verify_response.status_code == 200
        
        data = verify_response.json()
        assert data["valid"] == True
        assert data["section"] == "sales"
        print("Token verification successful")
    
    def test_logout(self):
        """Test logout functionality"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/workspace/auth/login", json={
            "employee_id": TEST_EMPLOYEE_ID,
            "password": TEST_PASSWORD,
            "section": "sales"
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Logout
        logout_response = requests.post(f"{BASE_URL}/api/workspace/auth/logout?token={token}")
        print(f"Logout response: {logout_response.status_code}")
        assert logout_response.status_code == 200
        
        # Verify token is invalid after logout
        verify_response = requests.get(f"{BASE_URL}/api/workspace/auth/verify?token={token}")
        assert verify_response.status_code == 401, "Token should be invalid after logout"
        print("Logout successful - token invalidated")


class TestLeadsDashboardStats:
    """Test leads dashboard stats API"""
    
    def test_dashboard_stats(self):
        """Test GET /api/leads/dashboard/stats"""
        response = requests.get(f"{BASE_URL}/api/leads/dashboard/stats")
        print(f"Dashboard stats response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify expected fields
        expected_fields = ["total_leads", "new", "contacted", "qualified", "converted", "today_visitors"]
        for field in expected_fields:
            assert field in data, f"Field '{field}' should be in response"
        print(f"Dashboard stats: total_leads={data['total_leads']}, new={data['new']}, converted={data['converted']}")


class TestLeadsAPI:
    """Test leads CRUD operations"""
    
    def test_list_all_leads(self):
        """Test GET /api/leads/all"""
        response = requests.get(f"{BASE_URL}/api/leads/all?limit=10")
        print(f"List leads response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "leads" in data, "Response should have 'leads' field"
        assert "total" in data, "Response should have 'total' field"
        print(f"Found {len(data['leads'])} leads, total: {data['total']}")
    
    def test_list_leads_with_status_filter(self):
        """Test GET /api/leads/all with status filter"""
        response = requests.get(f"{BASE_URL}/api/leads/all?status=new&limit=10")
        print(f"List leads (status=new) response: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        # All returned leads should have status 'new'
        for lead in data.get("leads", []):
            if lead.get("status"):
                assert lead["status"] == "new", f"Lead status should be 'new', got {lead['status']}"
        print(f"Found {len(data['leads'])} new leads")
    
    def test_submit_lead(self):
        """Test POST /api/leads/submit - create inbound lead"""
        test_lead = {
            "name": "TEST_Sales_Lead",
            "phone": "9999999999",
            "company": "Test Company",
            "service": "IT Support",
            "source": "test"
        }
        response = requests.post(f"{BASE_URL}/api/leads/submit", json=test_lead)
        print(f"Submit lead response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Lead submission should be successful"
        print("Lead submitted successfully")


class TestVisitorAnalytics:
    """Test visitor tracking and analytics APIs"""
    
    def test_visitor_stats(self):
        """Test GET /api/leads/visitors/stats"""
        response = requests.get(f"{BASE_URL}/api/leads/visitors/stats?days=7")
        print(f"Visitor stats response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "daily" in data, "Response should have 'daily' field"
        assert "top_pages" in data, "Response should have 'top_pages' field"
        assert "top_referrers" in data, "Response should have 'top_referrers' field"
        print(f"Visitor stats: {len(data['daily'])} days of data")
    
    def test_track_visitor(self):
        """Test POST /api/leads/track - track page visit"""
        event = {
            "page": "/test-page",
            "referrer": "https://google.com",
            "utm_source": "test",
            "session_id": "test-session-123"
        }
        response = requests.post(f"{BASE_URL}/api/leads/track", json=event)
        print(f"Track visitor response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("ok") == True, "Tracking should be successful"
        print("Visitor tracked successfully")


class TestScraperConfig:
    """Test scraper configuration API (NOT actual scraping - egress blocked)"""
    
    def test_scraper_config(self):
        """Test GET /api/leads/scraper/config"""
        response = requests.get(f"{BASE_URL}/api/leads/scraper/config")
        print(f"Scraper config response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "business_types" in data, "Response should have 'business_types'"
        assert "locations" in data, "Response should have 'locations'"
        assert "sources" in data, "Response should have 'sources'"
        print(f"Scraper config: {len(data['business_types'])} business types, {len(data['locations'])} locations")
    
    def test_scraper_jobs_list(self):
        """Test GET /api/leads/scraper/jobs"""
        response = requests.get(f"{BASE_URL}/api/leads/scraper/jobs")
        print(f"Scraper jobs response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Found {len(data)} scraper jobs")


class TestLeadUpdate:
    """Test lead update operations"""
    
    def test_update_lead_status(self):
        """Test PUT /api/leads/{lead_id} - update lead"""
        # First get a lead
        list_response = requests.get(f"{BASE_URL}/api/leads/all?limit=1")
        assert list_response.status_code == 200
        
        leads = list_response.json().get("leads", [])
        if not leads:
            print("No leads to update - skipping test")
            pytest.skip("No leads available to test update")
        
        lead_id = leads[0]["id"]
        original_status = leads[0].get("status", "new")
        
        # Update the lead
        update_data = {
            "notes": "TEST_Updated via API test",
            "priority": "high"
        }
        update_response = requests.put(f"{BASE_URL}/api/leads/{lead_id}", json=update_data)
        print(f"Update lead response: {update_response.status_code}")
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        print(f"Lead {lead_id} updated successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
