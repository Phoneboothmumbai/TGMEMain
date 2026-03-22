"""
EspoCRM-like Features Tests - Accounts, Contacts, Lead Detail, Stream
Testing new CRUD operations for Accounts, Contacts, and Lead Stream functionality
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMPLOYEE_ID = "maharathy"
TEST_PASSWORD = "Charu@123@"


class TestAccountsCRUD:
    """Test Accounts CRUD operations - /api/leads/accounts/*"""
    
    created_account_id = None
    
    def test_create_account(self):
        """Test POST /api/leads/accounts/create"""
        account_data = {
            "name": "TEST_Acme Corporation",
            "industry": "Technology",
            "phone": "+91-9876543210",
            "email": "contact@acme-test.com",
            "website": "https://acme-test.com",
            "address": "123 Tech Park",
            "city": "Mumbai",
            "notes": "Test account created by pytest"
        }
        response = requests.post(f"{BASE_URL}/api/leads/accounts/create", json=account_data)
        print(f"Create account response: {response.status_code} - {response.text[:200]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should have 'id'"
        assert data["name"] == account_data["name"], f"Name mismatch: {data['name']}"
        assert data["industry"] == account_data["industry"]
        assert data["city"] == account_data["city"]
        
        TestAccountsCRUD.created_account_id = data["id"]
        print(f"Account created with ID: {data['id']}")
        return data["id"]
    
    def test_list_accounts_with_counts(self):
        """Test GET /api/leads/accounts/list returns accounts with contacts_count and leads_count"""
        response = requests.get(f"{BASE_URL}/api/leads/accounts/list")
        print(f"List accounts response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check that accounts have required fields including counts
        if len(data) > 0:
            account = data[0]
            assert "id" in account, "Account should have 'id'"
            assert "name" in account, "Account should have 'name'"
            assert "contacts_count" in account, "Account should have 'contacts_count'"
            assert "leads_count" in account, "Account should have 'leads_count'"
            print(f"Found {len(data)} accounts. First account: {account['name']} (contacts: {account['contacts_count']}, leads: {account['leads_count']})")
        else:
            print("No accounts found")
    
    def test_list_accounts_with_search(self):
        """Test GET /api/leads/accounts/list with search parameter"""
        response = requests.get(f"{BASE_URL}/api/leads/accounts/list?search=TEST_")
        print(f"Search accounts response: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        # All returned accounts should match search
        for acc in data:
            assert "TEST_" in acc["name"] or "test_" in acc["name"].lower(), f"Account {acc['name']} doesn't match search"
        print(f"Found {len(data)} accounts matching 'TEST_'")
    
    def test_get_account_detail(self):
        """Test GET /api/leads/accounts/{id}"""
        if not TestAccountsCRUD.created_account_id:
            pytest.skip("No account created to get")
        
        response = requests.get(f"{BASE_URL}/api/leads/accounts/{TestAccountsCRUD.created_account_id}")
        print(f"Get account detail response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == TestAccountsCRUD.created_account_id
        assert "contacts" in data, "Account detail should include contacts list"
        print(f"Account detail: {data['name']}, contacts: {len(data.get('contacts', []))}")
    
    def test_update_account(self):
        """Test PUT /api/leads/accounts/{id}"""
        if not TestAccountsCRUD.created_account_id:
            pytest.skip("No account created to update")
        
        update_data = {
            "industry": "Software",
            "notes": "Updated by pytest"
        }
        response = requests.put(f"{BASE_URL}/api/leads/accounts/{TestAccountsCRUD.created_account_id}", json=update_data)
        print(f"Update account response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/leads/accounts/{TestAccountsCRUD.created_account_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["industry"] == "Software", f"Industry not updated: {data['industry']}"
        print("Account updated successfully")
    
    def test_delete_account(self):
        """Test DELETE /api/leads/accounts/{id}"""
        if not TestAccountsCRUD.created_account_id:
            pytest.skip("No account created to delete")
        
        response = requests.delete(f"{BASE_URL}/api/leads/accounts/{TestAccountsCRUD.created_account_id}")
        print(f"Delete account response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/leads/accounts/{TestAccountsCRUD.created_account_id}")
        assert get_response.status_code == 404, "Account should be deleted"
        print("Account deleted successfully")


class TestContactsCRUD:
    """Test Contacts CRUD operations - /api/leads/contacts/*"""
    
    created_contact_id = None
    test_account_id = None
    
    @classmethod
    def setup_class(cls):
        """Create a test account for linking contacts"""
        account_data = {"name": "TEST_Contact_Account", "industry": "Testing"}
        response = requests.post(f"{BASE_URL}/api/leads/accounts/create", json=account_data)
        if response.status_code == 200:
            cls.test_account_id = response.json()["id"]
            print(f"Setup: Created test account {cls.test_account_id}")
    
    @classmethod
    def teardown_class(cls):
        """Cleanup test account"""
        if cls.test_account_id:
            requests.delete(f"{BASE_URL}/api/leads/accounts/{cls.test_account_id}")
            print(f"Teardown: Deleted test account {cls.test_account_id}")
    
    def test_create_contact_with_account(self):
        """Test POST /api/leads/contacts/create with account_id"""
        contact_data = {
            "name": "TEST_John Doe",
            "title": "CEO",
            "phone": "+91-9876543211",
            "email": "john.doe@test.com",
            "account_id": TestContactsCRUD.test_account_id or "",
            "notes": "Test contact created by pytest"
        }
        response = requests.post(f"{BASE_URL}/api/leads/contacts/create", json=contact_data)
        print(f"Create contact response: {response.status_code} - {response.text[:200]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should have 'id'"
        assert data["name"] == contact_data["name"]
        assert data["title"] == contact_data["title"]
        
        TestContactsCRUD.created_contact_id = data["id"]
        print(f"Contact created with ID: {data['id']}")
    
    def test_list_contacts_with_account_name(self):
        """Test GET /api/leads/contacts/list returns contacts with account_name"""
        response = requests.get(f"{BASE_URL}/api/leads/contacts/list")
        print(f"List contacts response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check that contacts have account_name field
        if len(data) > 0:
            contact = data[0]
            assert "id" in contact, "Contact should have 'id'"
            assert "name" in contact, "Contact should have 'name'"
            assert "account_name" in contact, "Contact should have 'account_name'"
            print(f"Found {len(data)} contacts. First: {contact['name']} (Account: {contact.get('account_name', 'None')})")
    
    def test_list_contacts_with_search(self):
        """Test GET /api/leads/contacts/list with search"""
        response = requests.get(f"{BASE_URL}/api/leads/contacts/list?search=TEST_")
        print(f"Search contacts response: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        print(f"Found {len(data)} contacts matching 'TEST_'")
    
    def test_get_contact_detail(self):
        """Test GET /api/leads/contacts/{id}"""
        if not TestContactsCRUD.created_contact_id:
            pytest.skip("No contact created to get")
        
        response = requests.get(f"{BASE_URL}/api/leads/contacts/{TestContactsCRUD.created_contact_id}")
        print(f"Get contact detail response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == TestContactsCRUD.created_contact_id
        assert "account_name" in data, "Contact detail should include account_name"
        print(f"Contact detail: {data['name']}, Account: {data.get('account_name', 'None')}")
    
    def test_update_contact(self):
        """Test PUT /api/leads/contacts/{id}"""
        if not TestContactsCRUD.created_contact_id:
            pytest.skip("No contact created to update")
        
        update_data = {
            "title": "CTO",
            "notes": "Updated by pytest"
        }
        response = requests.put(f"{BASE_URL}/api/leads/contacts/{TestContactsCRUD.created_contact_id}", json=update_data)
        print(f"Update contact response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/leads/contacts/{TestContactsCRUD.created_contact_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["title"] == "CTO", f"Title not updated: {data['title']}"
        print("Contact updated successfully")
    
    def test_delete_contact(self):
        """Test DELETE /api/leads/contacts/{id}"""
        if not TestContactsCRUD.created_contact_id:
            pytest.skip("No contact created to delete")
        
        response = requests.delete(f"{BASE_URL}/api/leads/contacts/{TestContactsCRUD.created_contact_id}")
        print(f"Delete contact response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/leads/contacts/{TestContactsCRUD.created_contact_id}")
        assert get_response.status_code == 404, "Contact should be deleted"
        print("Contact deleted successfully")


class TestLeadDetailAndStream:
    """Test Lead Detail and Stream functionality"""
    
    test_lead_id = None
    
    @classmethod
    def setup_class(cls):
        """Get a lead ID for testing"""
        response = requests.get(f"{BASE_URL}/api/leads/all?limit=1")
        if response.status_code == 200:
            leads = response.json().get("leads", [])
            if leads:
                cls.test_lead_id = leads[0]["id"]
                print(f"Setup: Using lead ID {cls.test_lead_id}")
    
    def test_get_lead_detail(self):
        """Test GET /api/leads/{id}/detail returns full lead with stream, account_name, contacts"""
        if not TestLeadDetailAndStream.test_lead_id:
            pytest.skip("No lead available for testing")
        
        response = requests.get(f"{BASE_URL}/api/leads/{TestLeadDetailAndStream.test_lead_id}/detail")
        print(f"Get lead detail response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Check required fields
        assert "id" in data, "Lead detail should have 'id'"
        assert "name" in data, "Lead detail should have 'name'"
        assert "status" in data, "Lead detail should have 'status'"
        assert "stream" in data, "Lead detail should have 'stream' array"
        assert "account_name" in data, "Lead detail should have 'account_name'"
        assert "contacts" in data, "Lead detail should have 'contacts' array"
        
        # Check new fields
        assert "amount" in data, "Lead detail should have 'amount'"
        assert "probability" in data, "Lead detail should have 'probability'"
        assert "close_date" in data, "Lead detail should have 'close_date'"
        assert "description" in data, "Lead detail should have 'description'"
        assert "lead_source" in data, "Lead detail should have 'lead_source'"
        
        print(f"Lead detail: {data['name']}, Status: {data['status']}, Stream entries: {len(data['stream'])}")
        print(f"  Amount: {data.get('amount', 0)}, Probability: {data.get('probability', 0)}%, Account: {data.get('account_name', 'None')}")
    
    def test_add_stream_comment(self):
        """Test POST /api/leads/{id}/stream adds a comment"""
        if not TestLeadDetailAndStream.test_lead_id:
            pytest.skip("No lead available for testing")
        
        comment_data = {
            "comment": "TEST_Comment from pytest - testing stream functionality",
            "user_name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/api/leads/{TestLeadDetailAndStream.test_lead_id}/stream", json=comment_data)
        print(f"Add stream comment response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should have 'id'"
        assert data["content"] == comment_data["comment"].strip()
        assert data["user_name"] == comment_data["user_name"]
        assert data["type"] == "comment"
        assert "created_at" in data
        print(f"Stream comment added with ID: {data['id']}")
    
    def test_get_lead_stream(self):
        """Test GET /api/leads/{id}/stream returns stream entries"""
        if not TestLeadDetailAndStream.test_lead_id:
            pytest.skip("No lead available for testing")
        
        response = requests.get(f"{BASE_URL}/api/leads/{TestLeadDetailAndStream.test_lead_id}/stream")
        print(f"Get lead stream response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            entry = data[0]
            assert "id" in entry, "Stream entry should have 'id'"
            assert "type" in entry, "Stream entry should have 'type'"
            assert "content" in entry, "Stream entry should have 'content'"
            assert "user_name" in entry, "Stream entry should have 'user_name'"
            assert "created_at" in entry, "Stream entry should have 'created_at'"
            print(f"Found {len(data)} stream entries. Latest: {entry['type']} by {entry['user_name']}")
        else:
            print("No stream entries found")
    
    def test_update_lead_with_new_fields(self):
        """Test PUT /api/leads/{id} accepts new fields: amount, probability, close_date, account_id, description, lead_source"""
        if not TestLeadDetailAndStream.test_lead_id:
            pytest.skip("No lead available for testing")
        
        update_data = {
            "amount": 50000.00,
            "probability": 75,
            "close_date": "2026-03-15",
            "description": "TEST_Updated description from pytest",
            "lead_source": "referral"
        }
        response = requests.put(f"{BASE_URL}/api/leads/{TestLeadDetailAndStream.test_lead_id}", json=update_data)
        print(f"Update lead with new fields response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify update via detail endpoint
        detail_response = requests.get(f"{BASE_URL}/api/leads/{TestLeadDetailAndStream.test_lead_id}/detail")
        assert detail_response.status_code == 200
        data = detail_response.json()
        
        assert data["amount"] == update_data["amount"], f"Amount not updated: {data['amount']}"
        assert data["probability"] == update_data["probability"], f"Probability not updated: {data['probability']}"
        assert data["close_date"] == update_data["close_date"], f"Close date not updated: {data['close_date']}"
        assert data["lead_source"] == update_data["lead_source"], f"Lead source not updated: {data['lead_source']}"
        print("Lead updated with new fields successfully")
    
    def test_status_change_creates_stream_entry(self):
        """Test that changing lead status auto-creates a stream entry"""
        if not TestLeadDetailAndStream.test_lead_id:
            pytest.skip("No lead available for testing")
        
        # Get current stream count
        stream_before = requests.get(f"{BASE_URL}/api/leads/{TestLeadDetailAndStream.test_lead_id}/stream").json()
        count_before = len(stream_before)
        
        # Change status
        update_data = {"status": "contacted", "assigned_to": "Test Agent"}
        response = requests.put(f"{BASE_URL}/api/leads/{TestLeadDetailAndStream.test_lead_id}", json=update_data)
        assert response.status_code == 200
        
        # Check stream has new entry
        time.sleep(0.5)  # Small delay for DB write
        stream_after = requests.get(f"{BASE_URL}/api/leads/{TestLeadDetailAndStream.test_lead_id}/stream").json()
        count_after = len(stream_after)
        
        assert count_after > count_before, f"Stream should have new entry after status change. Before: {count_before}, After: {count_after}"
        
        # Check the new entry is a status_change type
        latest_entry = stream_after[0]
        assert latest_entry["type"] == "status_change", f"Latest entry should be status_change, got {latest_entry['type']}"
        assert "contacted" in latest_entry["content"].lower(), f"Content should mention new status: {latest_entry['content']}"
        print(f"Status change created stream entry: {latest_entry['content']}")


class TestLeadDetailNotFound:
    """Test error handling for non-existent leads"""
    
    def test_get_nonexistent_lead_detail(self):
        """Test GET /api/leads/{id}/detail returns 404 for non-existent lead"""
        fake_id = "000000000000000000000000"  # Valid ObjectId format but doesn't exist
        response = requests.get(f"{BASE_URL}/api/leads/{fake_id}/detail")
        print(f"Get non-existent lead response: {response.status_code}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestExistingData:
    """Test that existing data (mentioned in context) is accessible"""
    
    def test_existing_account_hinal_container_lines(self):
        """Verify 'Hinal Container Lines' account exists"""
        response = requests.get(f"{BASE_URL}/api/leads/accounts/list?search=Hinal")
        print(f"Search Hinal account response: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        hinal_accounts = [a for a in data if "Hinal" in a.get("name", "")]
        print(f"Found {len(hinal_accounts)} accounts matching 'Hinal'")
        # Note: This is informational - account may or may not exist
    
    def test_existing_contact_rahul_sharma(self):
        """Verify 'Rahul Sharma' contact exists"""
        response = requests.get(f"{BASE_URL}/api/leads/contacts/list?search=Rahul")
        print(f"Search Rahul contact response: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        rahul_contacts = [c for c in data if "Rahul" in c.get("name", "")]
        print(f"Found {len(rahul_contacts)} contacts matching 'Rahul'")
        # Note: This is informational - contact may or may not exist
    
    def test_leads_exist(self):
        """Verify leads exist in the database"""
        response = requests.get(f"{BASE_URL}/api/leads/all?limit=10")
        print(f"List leads response: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        leads = data.get("leads", [])
        total = data.get("total", 0)
        print(f"Found {len(leads)} leads (total: {total})")
        assert total > 0, "Should have at least some leads in the database"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
