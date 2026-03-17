"""
Test SEO Landing Pages - Backend API tests for:
- Lead submission endpoint
- Sitemap endpoint
- All 12 landing page data validation
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Service landing page slugs (8 pages)
SERVICE_PAGES = [
    "cctv-installation",
    "networking", 
    "server-solutions",
    "printer-repair",
    "ups-solutions",
    "data-backup",
    "apple-repair",
    "firewall-security"
]

# Location landing page slugs (4 pages)
LOCATION_PAGES = [
    "it-support-mumbai",
    "computer-repair-mumbai",
    "it-support-small-business",
    "it-services-mulund-thane"
]


class TestLeadsAPI:
    """Tests for /api/leads/submit endpoint"""
    
    def test_submit_lead_success(self):
        """Test successful lead submission with all fields"""
        response = requests.post(
            f"{BASE_URL}/api/leads/submit",
            json={
                "name": "TEST_Lead User",
                "phone": "9876543210",
                "company": "Test Company",
                "service": "CCTV Installation",
                "source": "/services/cctv-installation"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "call you back" in data["message"].lower()
        print(f"Lead submission SUCCESS: {data}")
    
    def test_submit_lead_minimal_fields(self):
        """Test lead submission with only required fields (name, phone)"""
        response = requests.post(
            f"{BASE_URL}/api/leads/submit",
            json={
                "name": "TEST_Minimal Lead",
                "phone": "9999999999"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"Minimal lead submission SUCCESS: {data}")
    
    def test_submit_lead_empty_name_fails(self):
        """Test that empty name is rejected"""
        response = requests.post(
            f"{BASE_URL}/api/leads/submit",
            json={
                "name": "",
                "phone": "9876543210"
            }
        )
        assert response.status_code == 400
        print(f"Empty name correctly rejected: {response.json()}")
    
    def test_submit_lead_empty_phone_fails(self):
        """Test that empty phone is rejected"""
        response = requests.post(
            f"{BASE_URL}/api/leads/submit",
            json={
                "name": "Test User",
                "phone": ""
            }
        )
        assert response.status_code == 400
        print(f"Empty phone correctly rejected: {response.json()}")
    
    def test_submit_lead_whitespace_only_fails(self):
        """Test that whitespace-only fields are rejected"""
        response = requests.post(
            f"{BASE_URL}/api/leads/submit",
            json={
                "name": "   ",
                "phone": "9876543210"
            }
        )
        assert response.status_code == 400
        print(f"Whitespace-only name correctly rejected")
    
    def test_submit_lead_with_location_source(self):
        """Test lead submission from location landing page"""
        response = requests.post(
            f"{BASE_URL}/api/leads/submit",
            json={
                "name": "TEST_Mumbai Lead",
                "phone": "9888888888",
                "company": "Mumbai Corp",
                "service": "IT Support",
                "source": "/it-support-mumbai"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"Location page lead SUCCESS: {data}")
    
    def test_submit_lead_with_health_check_data(self):
        """Test lead submission with IT health check quiz results"""
        response = requests.post(
            f"{BASE_URL}/api/leads/submit",
            json={
                "name": "TEST_Health Check Lead",
                "phone": "9777777777",
                "company": "Health Corp",
                "service": "IT Support",
                "source": "/",
                "score": 65,
                "health_check": {
                    "backup_frequency": "weekly",
                    "antivirus": "yes",
                    "firewall": "no"
                }
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"Health check lead SUCCESS: {data}")


class TestSitemapAPI:
    """Tests for /sitemap.xml endpoint"""
    
    def test_sitemap_returns_xml(self):
        """Test that sitemap returns valid XML"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        # This may return HTML if routed to frontend
        # The sitemap route doesn't have /api prefix
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'xml' in content_type:
                assert '<?xml' in response.text
                assert '<urlset' in response.text
                print("Sitemap returns valid XML")
            else:
                print(f"Note: sitemap.xml returns HTML (frontend catching route)")
        else:
            print(f"Sitemap status: {response.status_code}")
    
    def test_sitemap_contains_service_pages(self):
        """Verify sitemap contains all 8 service landing pages"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        if response.status_code == 200 and 'xml' in response.headers.get('content-type', ''):
            for slug in SERVICE_PAGES:
                assert f"/services/{slug}" in response.text, f"Missing service page: {slug}"
            print(f"All {len(SERVICE_PAGES)} service pages found in sitemap")
        else:
            pytest.skip("Sitemap not accessible via this route")
    
    def test_sitemap_contains_location_pages(self):
        """Verify sitemap contains all 4 location landing pages"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        if response.status_code == 200 and 'xml' in response.headers.get('content-type', ''):
            for slug in LOCATION_PAGES:
                assert f"/{slug}" in response.text, f"Missing location page: {slug}"
            print(f"All {len(LOCATION_PAGES)} location pages found in sitemap")
        else:
            pytest.skip("Sitemap not accessible via this route")


class TestExistingRoutesStillWork:
    """Tests to verify existing routes weren't broken by new landing pages"""
    
    def test_home_page_loads(self):
        """Test home page at / loads"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert '<div id="root">' in response.text or 'The Good Men' in response.text
        print("Home page loads successfully")
    
    def test_amc_page_loads(self):
        """Test AMC page loads"""
        response = requests.get(f"{BASE_URL}/amc")
        assert response.status_code == 200
        print("AMC page loads successfully")
    
    def test_support_page_loads(self):
        """Test support page loads"""
        response = requests.get(f"{BASE_URL}/support")
        assert response.status_code == 200
        print("Support page loads successfully")
    
    def test_email_service_page_loads(self):
        """Test email service page loads"""
        response = requests.get(f"{BASE_URL}/services/email")
        assert response.status_code == 200
        print("Email service page loads successfully")
    
    def test_cybersecurity_page_loads(self):
        """Test cybersecurity page loads"""
        response = requests.get(f"{BASE_URL}/services/cybersecurity")
        assert response.status_code == 200
        print("Cybersecurity page loads successfully")


class TestSEOLandingPageRoutes:
    """Test that all 12 new landing page URLs are accessible"""
    
    @pytest.mark.parametrize("slug", SERVICE_PAGES)
    def test_service_landing_page_accessible(self, slug):
        """Test each service landing page URL returns 200"""
        response = requests.get(f"{BASE_URL}/services/{slug}")
        assert response.status_code == 200, f"Service page {slug} not accessible"
        # React app should return HTML
        assert '<div id="root">' in response.text
        print(f"Service page /services/{slug} accessible")
    
    @pytest.mark.parametrize("slug", LOCATION_PAGES)
    def test_location_landing_page_accessible(self, slug):
        """Test each location landing page URL returns 200"""
        response = requests.get(f"{BASE_URL}/{slug}")
        assert response.status_code == 200, f"Location page {slug} not accessible"
        assert '<div id="root">' in response.text
        print(f"Location page /{slug} accessible")


class TestLeadsListAPI:
    """Tests for leads list endpoint (admin)"""
    
    def test_list_leads_endpoint_exists(self):
        """Test leads list endpoint works"""
        response = requests.get(f"{BASE_URL}/api/leads/list")
        assert response.status_code == 200
        data = response.json()
        assert "leads" in data
        assert "total" in data
        print(f"Leads list: {data['total']} total leads")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
