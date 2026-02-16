"""
Knowledge Base API Tests
Tests all KB endpoints: Admin Auth, Categories, Subcategories, Articles, Public API
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_ADMIN_USERNAME = "testadmin"
TEST_ADMIN_PASSWORD = "testpass123"

class TestKBAdminAuth:
    """Test KB Admin Authentication endpoints"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    def test_admin_setup(self, session):
        """Test POST /api/kb/admin/setup - Create initial admin"""
        response = session.post(f"{BASE_URL}/api/kb/admin/setup", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        # Either 200 (created) or 400 (already exists)
        assert response.status_code in [200, 400], f"Setup failed: {response.text}"
        if response.status_code == 200:
            data = response.json()
            assert "message" in data
            print(f"Admin setup: {data['message']}")
        else:
            print("Admin already exists, proceeding with login")
    
    def test_admin_login_success(self, session):
        """Test POST /api/kb/admin/login - Successful login"""
        response = session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0
        print(f"Login successful, token received")
    
    def test_admin_login_invalid_credentials(self, session):
        """Test POST /api/kb/admin/login - Invalid credentials"""
        response = session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": "wronguser",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("Invalid credentials correctly rejected")
    
    def test_admin_me_with_token(self, session):
        """Test GET /api/kb/admin/me - Verify token"""
        # First login to get token
        login_response = session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Test /me endpoint
        response = session.get(f"{BASE_URL}/api/kb/admin/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Me endpoint failed: {response.text}"
        data = response.json()
        assert "username" in data
        assert data["username"] == TEST_ADMIN_USERNAME
        print(f"Admin verified: {data['username']}")
    
    def test_admin_me_without_token(self, session):
        """Test GET /api/kb/admin/me - Without token should fail"""
        response = session.get(f"{BASE_URL}/api/kb/admin/me")
        assert response.status_code in [401, 403]
        print("Unauthorized access correctly rejected")


class TestKBCategories:
    """Test KB Categories CRUD endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        session = requests.Session()
        # Login and get token
        response = session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json()["access_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    @pytest.fixture(scope="class")
    def created_category_id(self, auth_session):
        """Create a test category and return its ID"""
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/categories", json={
            "name": "TEST_Getting Started",
            "slug": "test-getting-started",
            "description": "Test category for getting started guides",
            "icon": "BookOpen",
            "order": 1
        })
        if response.status_code == 200:
            return response.json()["id"]
        elif response.status_code == 400 and "Slug already exists" in response.text:
            # Get existing category
            cats = auth_session.get(f"{BASE_URL}/api/kb/admin/categories").json()
            for cat in cats:
                if cat["slug"] == "test-getting-started":
                    return cat["id"]
        return None
    
    def test_create_category(self, auth_session):
        """Test POST /api/kb/admin/categories - Create category"""
        unique_slug = f"test-category-{int(time.time())}"
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/categories", json={
            "name": "TEST_Unique Category",
            "slug": unique_slug,
            "description": "A unique test category",
            "icon": "Folder",
            "order": 99
        })
        assert response.status_code == 200, f"Create category failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_Unique Category"
        assert data["slug"] == unique_slug
        print(f"Category created: {data['id']}")
        
        # Cleanup - delete the category
        auth_session.delete(f"{BASE_URL}/api/kb/admin/categories/{data['id']}")
    
    def test_get_all_categories(self, auth_session, created_category_id):
        """Test GET /api/kb/admin/categories - Get all categories"""
        response = auth_session.get(f"{BASE_URL}/api/kb/admin/categories")
        assert response.status_code == 200, f"Get categories failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} categories")
    
    def test_get_single_category(self, auth_session, created_category_id):
        """Test GET /api/kb/admin/categories/{id} - Get single category"""
        if not created_category_id:
            pytest.skip("No category created")
        response = auth_session.get(f"{BASE_URL}/api/kb/admin/categories/{created_category_id}")
        assert response.status_code == 200, f"Get category failed: {response.text}"
        data = response.json()
        assert data["id"] == created_category_id
        print(f"Category retrieved: {data['name']}")
    
    def test_update_category(self, auth_session, created_category_id):
        """Test PUT /api/kb/admin/categories/{id} - Update category"""
        if not created_category_id:
            pytest.skip("No category created")
        response = auth_session.put(f"{BASE_URL}/api/kb/admin/categories/{created_category_id}", json={
            "description": "Updated description for testing"
        })
        assert response.status_code == 200, f"Update category failed: {response.text}"
        data = response.json()
        assert data["description"] == "Updated description for testing"
        print(f"Category updated: {data['name']}")
    
    def test_create_duplicate_slug_fails(self, auth_session, created_category_id):
        """Test POST /api/kb/admin/categories - Duplicate slug should fail"""
        if not created_category_id:
            pytest.skip("No category created")
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/categories", json={
            "name": "Duplicate Category",
            "slug": "test-getting-started",  # Same slug as created_category
            "description": "This should fail"
        })
        assert response.status_code == 400
        print("Duplicate slug correctly rejected")


class TestKBSubcategories:
    """Test KB Subcategories CRUD endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json()["access_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    @pytest.fixture(scope="class")
    def main_category_id(self, auth_session):
        """Get or create a main category for subcategory tests"""
        # Try to get existing
        cats = auth_session.get(f"{BASE_URL}/api/kb/admin/categories").json()
        for cat in cats:
            if cat["slug"] == "test-getting-started":
                return cat["id"]
        
        # Create new
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/categories", json={
            "name": "TEST_Getting Started",
            "slug": "test-getting-started",
            "description": "Test category",
            "order": 1
        })
        if response.status_code == 200:
            return response.json()["id"]
        return None
    
    @pytest.fixture(scope="class")
    def created_subcategory_id(self, auth_session, main_category_id):
        """Create a test subcategory and return its ID"""
        if not main_category_id:
            return None
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/subcategories", json={
            "main_category_id": main_category_id,
            "name": "TEST_Installation Guide",
            "slug": "test-installation-guide",
            "description": "Test subcategory for installation guides",
            "order": 1
        })
        if response.status_code == 200:
            return response.json()["id"]
        elif response.status_code == 400 and "Slug already exists" in response.text:
            # Get existing
            subcats = auth_session.get(f"{BASE_URL}/api/kb/admin/subcategories").json()
            for sub in subcats:
                if sub["slug"] == "test-installation-guide":
                    return sub["id"]
        return None
    
    def test_create_subcategory(self, auth_session, main_category_id):
        """Test POST /api/kb/admin/subcategories - Create subcategory"""
        if not main_category_id:
            pytest.skip("No main category available")
        unique_slug = f"test-subcat-{int(time.time())}"
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/subcategories", json={
            "main_category_id": main_category_id,
            "name": "TEST_Unique Subcategory",
            "slug": unique_slug,
            "description": "A unique test subcategory",
            "order": 99
        })
        assert response.status_code == 200, f"Create subcategory failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_Unique Subcategory"
        assert data["main_category_id"] == main_category_id
        print(f"Subcategory created: {data['id']}")
        
        # Cleanup
        auth_session.delete(f"{BASE_URL}/api/kb/admin/subcategories/{data['id']}")
    
    def test_get_all_subcategories(self, auth_session):
        """Test GET /api/kb/admin/subcategories - Get all subcategories"""
        response = auth_session.get(f"{BASE_URL}/api/kb/admin/subcategories")
        assert response.status_code == 200, f"Get subcategories failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} subcategories")
    
    def test_get_subcategories_by_category(self, auth_session, main_category_id):
        """Test GET /api/kb/admin/subcategories?main_category_id=X - Filter by category"""
        if not main_category_id:
            pytest.skip("No main category available")
        response = auth_session.get(f"{BASE_URL}/api/kb/admin/subcategories", params={
            "main_category_id": main_category_id
        })
        assert response.status_code == 200
        data = response.json()
        for sub in data:
            assert sub["main_category_id"] == main_category_id
        print(f"Found {len(data)} subcategories in category")
    
    def test_update_subcategory(self, auth_session, created_subcategory_id):
        """Test PUT /api/kb/admin/subcategories/{id} - Update subcategory"""
        if not created_subcategory_id:
            pytest.skip("No subcategory created")
        response = auth_session.put(f"{BASE_URL}/api/kb/admin/subcategories/{created_subcategory_id}", json={
            "description": "Updated subcategory description"
        })
        assert response.status_code == 200, f"Update subcategory failed: {response.text}"
        data = response.json()
        assert data["description"] == "Updated subcategory description"
        print(f"Subcategory updated: {data['name']}")
    
    def test_create_subcategory_invalid_category(self, auth_session):
        """Test POST /api/kb/admin/subcategories - Invalid main_category_id should fail"""
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/subcategories", json={
            "main_category_id": "invalid-category-id",
            "name": "Invalid Subcategory",
            "slug": "invalid-subcat",
            "description": "This should fail"
        })
        assert response.status_code == 400
        print("Invalid main_category_id correctly rejected")


class TestKBArticles:
    """Test KB Articles CRUD endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json()["access_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    @pytest.fixture(scope="class")
    def subcategory_id(self, auth_session):
        """Get or create a subcategory for article tests"""
        # Get existing subcategories
        subcats = auth_session.get(f"{BASE_URL}/api/kb/admin/subcategories").json()
        if subcats:
            return subcats[0]["id"]
        
        # Need to create category first
        cats = auth_session.get(f"{BASE_URL}/api/kb/admin/categories").json()
        if not cats:
            cat_response = auth_session.post(f"{BASE_URL}/api/kb/admin/categories", json={
                "name": "TEST_Articles Category",
                "slug": "test-articles-category",
                "description": "Category for article tests"
            })
            if cat_response.status_code != 200:
                return None
            cat_id = cat_response.json()["id"]
        else:
            cat_id = cats[0]["id"]
        
        # Create subcategory
        sub_response = auth_session.post(f"{BASE_URL}/api/kb/admin/subcategories", json={
            "main_category_id": cat_id,
            "name": "TEST_Articles Subcategory",
            "slug": "test-articles-subcategory",
            "description": "Subcategory for article tests"
        })
        if sub_response.status_code == 200:
            return sub_response.json()["id"]
        return None
    
    @pytest.fixture(scope="class")
    def created_article_id(self, auth_session, subcategory_id):
        """Create a test article and return its ID"""
        if not subcategory_id:
            return None
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/articles", json={
            "subcategory_id": subcategory_id,
            "title": "TEST_How to Get Started",
            "slug": "test-how-to-get-started",
            "excerpt": "A test article about getting started",
            "content": "<h1>Getting Started</h1><p>This is test content.</p>",
            "status": "published",
            "tags": ["test", "getting-started"],
            "order": 1
        })
        if response.status_code == 200:
            return response.json()["id"]
        return None
    
    def test_create_article(self, auth_session, subcategory_id):
        """Test POST /api/kb/admin/articles - Create article"""
        if not subcategory_id:
            pytest.skip("No subcategory available")
        unique_slug = f"test-article-{int(time.time())}"
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/articles", json={
            "subcategory_id": subcategory_id,
            "title": "TEST_Unique Article",
            "slug": unique_slug,
            "excerpt": "A unique test article",
            "content": "<p>Test content for unique article</p>",
            "status": "draft",
            "tags": ["test"],
            "order": 99
        })
        assert response.status_code == 200, f"Create article failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["title"] == "TEST_Unique Article"
        assert data["subcategory_id"] == subcategory_id
        assert data["status"] == "draft"
        print(f"Article created: {data['id']}")
        
        # Cleanup
        auth_session.delete(f"{BASE_URL}/api/kb/admin/articles/{data['id']}")
    
    def test_get_all_articles(self, auth_session):
        """Test GET /api/kb/admin/articles - Get all articles"""
        response = auth_session.get(f"{BASE_URL}/api/kb/admin/articles")
        assert response.status_code == 200, f"Get articles failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} articles")
    
    def test_get_articles_by_status(self, auth_session):
        """Test GET /api/kb/admin/articles?status=published - Filter by status"""
        response = auth_session.get(f"{BASE_URL}/api/kb/admin/articles", params={
            "status": "published"
        })
        assert response.status_code == 200
        data = response.json()
        for article in data:
            assert article["status"] == "published"
        print(f"Found {len(data)} published articles")
    
    def test_get_single_article(self, auth_session, created_article_id):
        """Test GET /api/kb/admin/articles/{id} - Get single article"""
        if not created_article_id:
            pytest.skip("No article created")
        response = auth_session.get(f"{BASE_URL}/api/kb/admin/articles/{created_article_id}")
        assert response.status_code == 200, f"Get article failed: {response.text}"
        data = response.json()
        assert data["id"] == created_article_id
        assert "subcategory_name" in data  # ArticleWithCategory response
        print(f"Article retrieved: {data['title']}")
    
    def test_update_article(self, auth_session, created_article_id):
        """Test PUT /api/kb/admin/articles/{id} - Update article"""
        if not created_article_id:
            pytest.skip("No article created")
        response = auth_session.put(f"{BASE_URL}/api/kb/admin/articles/{created_article_id}", json={
            "title": "TEST_Updated Article Title",
            "content": "<h1>Updated Content</h1><p>This content was updated.</p>"
        })
        assert response.status_code == 200, f"Update article failed: {response.text}"
        data = response.json()
        assert data["title"] == "TEST_Updated Article Title"
        print(f"Article updated: {data['title']}")
        
        # Verify persistence with GET
        get_response = auth_session.get(f"{BASE_URL}/api/kb/admin/articles/{created_article_id}")
        assert get_response.status_code == 200
        assert get_response.json()["title"] == "TEST_Updated Article Title"
    
    def test_create_article_invalid_subcategory(self, auth_session):
        """Test POST /api/kb/admin/articles - Invalid subcategory_id should fail"""
        response = auth_session.post(f"{BASE_URL}/api/kb/admin/articles", json={
            "subcategory_id": "invalid-subcategory-id",
            "title": "Invalid Article",
            "slug": "invalid-article",
            "content": "This should fail"
        })
        assert response.status_code == 400
        print("Invalid subcategory_id correctly rejected")


class TestKBStats:
    """Test KB Stats endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json()["access_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_get_stats(self, auth_session):
        """Test GET /api/kb/admin/stats - Get KB statistics"""
        response = auth_session.get(f"{BASE_URL}/api/kb/admin/stats")
        assert response.status_code == 200, f"Get stats failed: {response.text}"
        data = response.json()
        assert "total_categories" in data
        assert "total_subcategories" in data
        assert "total_articles" in data
        assert "published_articles" in data
        assert "draft_articles" in data
        assert "total_views" in data
        print(f"Stats: {data['total_categories']} categories, {data['total_articles']} articles")


class TestKBPublicAPI:
    """Test KB Public API endpoints (no auth required)"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    def test_public_get_categories(self, session):
        """Test GET /api/kb/public/categories - Get all public categories"""
        response = session.get(f"{BASE_URL}/api/kb/public/categories")
        assert response.status_code == 200, f"Get public categories failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        for cat in data:
            assert "id" in cat
            assert "name" in cat
            assert "slug" in cat
            assert "subcategories" in cat
        print(f"Found {len(data)} public categories")
    
    def test_public_get_category_by_slug(self, session):
        """Test GET /api/kb/public/categories/{slug} - Get single category"""
        # First get all categories to find a valid slug
        cats_response = session.get(f"{BASE_URL}/api/kb/public/categories")
        cats = cats_response.json()
        if not cats:
            pytest.skip("No categories available")
        
        slug = cats[0]["slug"]
        response = session.get(f"{BASE_URL}/api/kb/public/categories/{slug}")
        assert response.status_code == 200, f"Get public category failed: {response.text}"
        data = response.json()
        assert data["slug"] == slug
        assert "subcategories" in data
        print(f"Public category retrieved: {data['name']}")
    
    def test_public_get_category_not_found(self, session):
        """Test GET /api/kb/public/categories/{slug} - Non-existent category"""
        response = session.get(f"{BASE_URL}/api/kb/public/categories/non-existent-category-slug")
        assert response.status_code == 404
        print("Non-existent category correctly returns 404")
    
    def test_public_get_subcategory_articles(self, session):
        """Test GET /api/kb/public/subcategories/{slug}/articles - Get articles in subcategory"""
        # First get categories to find a subcategory
        cats_response = session.get(f"{BASE_URL}/api/kb/public/categories")
        cats = cats_response.json()
        
        subcat_slug = None
        for cat in cats:
            if cat.get("subcategories"):
                subcat_slug = cat["subcategories"][0]["slug"]
                break
        
        if not subcat_slug:
            pytest.skip("No subcategories available")
        
        response = session.get(f"{BASE_URL}/api/kb/public/subcategories/{subcat_slug}/articles")
        assert response.status_code == 200, f"Get subcategory articles failed: {response.text}"
        data = response.json()
        assert "subcategory" in data
        assert "main_category" in data
        assert "articles" in data
        print(f"Found {len(data['articles'])} articles in subcategory")
    
    def test_public_get_article_by_slug(self, session):
        """Test GET /api/kb/public/articles/{slug} - Get single article"""
        # Need to find a published article
        # First, let's check if we have any published articles via admin API
        auth_session = requests.Session()
        login_response = auth_session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        if login_response.status_code != 200:
            pytest.skip("Could not authenticate to find articles")
        
        token = login_response.json()["access_token"]
        articles_response = auth_session.get(f"{BASE_URL}/api/kb/admin/articles", 
            params={"status": "published"},
            headers={"Authorization": f"Bearer {token}"}
        )
        articles = articles_response.json()
        
        if not articles:
            pytest.skip("No published articles available")
        
        slug = articles[0]["slug"]
        response = session.get(f"{BASE_URL}/api/kb/public/articles/{slug}")
        assert response.status_code == 200, f"Get public article failed: {response.text}"
        data = response.json()
        assert data["slug"] == slug
        assert "content" in data
        assert "views" in data
        print(f"Public article retrieved: {data['title']}")
    
    def test_public_search(self, session):
        """Test GET /api/kb/public/search?q=query - Search articles"""
        response = session.get(f"{BASE_URL}/api/kb/public/search", params={"q": "test"})
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Search found {len(data)} results")
    
    def test_public_search_min_length(self, session):
        """Test GET /api/kb/public/search - Query too short should fail"""
        response = session.get(f"{BASE_URL}/api/kb/public/search", params={"q": "a"})
        assert response.status_code == 422  # Validation error
        print("Short search query correctly rejected")


class TestKBCleanup:
    """Cleanup test data after all tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/kb/admin/login", json={
            "username": TEST_ADMIN_USERNAME,
            "password": TEST_ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        token = response.json()["access_token"]
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_cleanup_test_data(self, auth_session):
        """Clean up TEST_ prefixed data"""
        # Get all articles and delete TEST_ ones
        articles = auth_session.get(f"{BASE_URL}/api/kb/admin/articles").json()
        for article in articles:
            if article["title"].startswith("TEST_"):
                auth_session.delete(f"{BASE_URL}/api/kb/admin/articles/{article['id']}")
                print(f"Deleted test article: {article['title']}")
        
        # Get all subcategories and delete TEST_ ones
        subcats = auth_session.get(f"{BASE_URL}/api/kb/admin/subcategories").json()
        for subcat in subcats:
            if subcat["name"].startswith("TEST_"):
                auth_session.delete(f"{BASE_URL}/api/kb/admin/subcategories/{subcat['id']}")
                print(f"Deleted test subcategory: {subcat['name']}")
        
        # Get all categories and delete TEST_ ones
        cats = auth_session.get(f"{BASE_URL}/api/kb/admin/categories").json()
        for cat in cats:
            if cat["name"].startswith("TEST_"):
                auth_session.delete(f"{BASE_URL}/api/kb/admin/categories/{cat['id']}")
                print(f"Deleted test category: {cat['name']}")
        
        print("Cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
