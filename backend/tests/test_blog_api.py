"""
Blog API Tests - Testing blog CRUD, settings, scheduler status, and category endpoints
Skip: POST /api/blog/generate (timeout due to DeepSeek API response time)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestBlogCategories:
    """Test GET /api/blog/categories - returns 10 blog categories"""
    
    def test_get_categories_returns_list(self):
        """GET /api/blog/categories returns 10 categories"""
        response = requests.get(f"{BASE_URL}/api/blog/categories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Categories should be a list"
        assert len(data) == 10, f"Expected 10 categories, got {len(data)}"
        
        expected_categories = [
            "How-To Guides",
            "Cybersecurity & Privacy",
            "Troubleshooting & Tech Support",
            "Product Reviews & Comparisons",
            "Web Hosting & Domains",
            "Business IT Solutions",
            "Cloud & Business Tools",
            "Networking & Infrastructure",
            "Backup & Disaster Recovery",
            "Hardware & Devices",
        ]
        for cat in expected_categories:
            assert cat in data, f"Missing category: {cat}"


class TestBlogSettings:
    """Test blog settings CRUD operations"""
    
    def test_get_settings_returns_defaults(self):
        """GET /api/blog/settings returns settings with expected keys"""
        response = requests.get(f"{BASE_URL}/api/blog/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "auto_generate_enabled" in data, "Missing auto_generate_enabled"
        assert "posts_per_week" in data, "Missing posts_per_week"
        assert "preferred_days" in data, "Missing preferred_days"
        assert "preferred_hour" in data, "Missing preferred_hour"
        
        assert isinstance(data["auto_generate_enabled"], bool)
        assert isinstance(data["posts_per_week"], int)
        assert isinstance(data["preferred_days"], list)
        assert isinstance(data["preferred_hour"], int)
    
    def test_update_settings_posts_per_week(self):
        """PUT /api/blog/settings updates posts_per_week and auto-derives preferred_days"""
        # Get current settings first
        original = requests.get(f"{BASE_URL}/api/blog/settings").json()
        
        # Update posts_per_week
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"posts_per_week": 3}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "settings" in data, "Response should contain settings"
        settings = data["settings"]
        assert settings["posts_per_week"] == 3, "posts_per_week should be updated to 3"
        # preferred_days should be auto-derived
        assert len(settings["preferred_days"]) == 3, "preferred_days should have 3 days"
        
        # Restore original
        requests.put(f"{BASE_URL}/api/blog/settings", json={
            "posts_per_week": original["posts_per_week"],
            "preferred_days": original["preferred_days"]
        })
    
    def test_update_settings_preferred_days(self):
        """PUT /api/blog/settings updates preferred_days correctly"""
        original = requests.get(f"{BASE_URL}/api/blog/settings").json()
        
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"preferred_days": ["tuesday", "friday"]}
        )
        assert response.status_code == 200
        
        data = response.json()
        settings = data["settings"]
        assert "tuesday" in settings["preferred_days"]
        assert "friday" in settings["preferred_days"]
        
        # Restore original
        requests.put(f"{BASE_URL}/api/blog/settings", json=original)
    
    def test_update_settings_preferred_hour(self):
        """PUT /api/blog/settings updates preferred_hour correctly"""
        original = requests.get(f"{BASE_URL}/api/blog/settings").json()
        
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"preferred_hour": 15}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["settings"]["preferred_hour"] == 15
        
        # Restore original
        requests.put(f"{BASE_URL}/api/blog/settings", json=original)
    
    def test_update_settings_auto_generate_toggle(self):
        """PUT /api/blog/settings toggles auto_generate_enabled"""
        original = requests.get(f"{BASE_URL}/api/blog/settings").json()
        
        # Toggle to true
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"auto_generate_enabled": True}
        )
        assert response.status_code == 200
        assert response.json()["settings"]["auto_generate_enabled"] == True
        
        # Toggle back to false
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"auto_generate_enabled": False}
        )
        assert response.status_code == 200
        assert response.json()["settings"]["auto_generate_enabled"] == False
        
        # Restore original
        requests.put(f"{BASE_URL}/api/blog/settings", json=original)
    
    def test_settings_validation_posts_per_week_invalid(self):
        """PUT /api/blog/settings validates posts_per_week (1-7)"""
        # Test value too low (0)
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"posts_per_week": 0}
        )
        assert response.status_code == 400, "posts_per_week=0 should return 400"
        
        # Test value too high (8)
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"posts_per_week": 8}
        )
        assert response.status_code == 400, "posts_per_week=8 should return 400"
    
    def test_settings_validation_preferred_hour_invalid(self):
        """PUT /api/blog/settings validates preferred_hour (0-23)"""
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"preferred_hour": 24}
        )
        assert response.status_code == 400, "preferred_hour=24 should return 400"
        
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"preferred_hour": -1}
        )
        assert response.status_code == 400, "preferred_hour=-1 should return 400"
    
    def test_settings_validation_preferred_days_invalid(self):
        """PUT /api/blog/settings validates preferred_days (valid day names)"""
        response = requests.put(
            f"{BASE_URL}/api/blog/settings",
            json={"preferred_days": ["invalid_day"]}
        )
        assert response.status_code == 400, "Invalid day name should return 400"


class TestSchedulerStatus:
    """Test GET /api/blog/scheduler-status"""
    
    def test_get_scheduler_status(self):
        """GET /api/blog/scheduler-status returns scheduler state"""
        response = requests.get(f"{BASE_URL}/api/blog/scheduler-status")
        assert response.status_code == 200
        
        data = response.json()
        assert "scheduler_running" in data, "Missing scheduler_running"
        assert "job_active" in data, "Missing job_active"
        assert "next_run" in data, "Missing next_run"
        assert "settings" in data, "Missing settings"
        
        assert isinstance(data["scheduler_running"], bool)
        assert isinstance(data["job_active"], bool)
        # next_run can be None or a string
        assert data["next_run"] is None or isinstance(data["next_run"], str)


class TestBlogPosts:
    """Test blog posts CRUD operations"""
    
    def test_get_pending_posts(self):
        """GET /api/blog/posts?status=pending returns pending posts"""
        response = requests.get(f"{BASE_URL}/api/blog/posts", params={"status": "pending"})
        assert response.status_code == 200
        
        data = response.json()
        assert "posts" in data, "Response should have posts key"
        assert "total" in data, "Response should have total key"
        assert "page" in data, "Response should have page key"
        assert "pages" in data, "Response should have pages key"
        
        # Verify all posts have pending status
        for post in data["posts"]:
            assert post["status"] == "pending", f"Post {post.get('post_id')} is not pending"
    
    def test_get_published_posts(self):
        """GET /api/blog/posts?status=published returns published posts"""
        response = requests.get(f"{BASE_URL}/api/blog/posts", params={"status": "published"})
        assert response.status_code == 200
        
        data = response.json()
        assert "posts" in data
        
        # Verify all posts have published status
        for post in data["posts"]:
            assert post["status"] == "published"
    
    def test_get_post_by_slug_or_id(self):
        """GET /api/blog/posts/{slug_or_id} returns full post"""
        # First get a post from the list
        list_response = requests.get(f"{BASE_URL}/api/blog/posts", params={"status": "published", "limit": 1})
        posts = list_response.json().get("posts", [])
        
        if not posts:
            # Try pending posts if no published
            list_response = requests.get(f"{BASE_URL}/api/blog/posts", params={"status": "pending", "limit": 1})
            posts = list_response.json().get("posts", [])
        
        if posts:
            post = posts[0]
            slug = post["slug"]
            post_id = post["post_id"]
            
            # Test by slug
            response = requests.get(f"{BASE_URL}/api/blog/posts/{slug}")
            assert response.status_code == 200
            data = response.json()
            assert data["slug"] == slug
            assert "content" in data, "Full post should include content"
            assert "title" in data
            assert "excerpt" in data
            assert "category" in data
            
            # Test by post_id
            response = requests.get(f"{BASE_URL}/api/blog/posts/{post_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["post_id"] == post_id
        else:
            pytest.skip("No posts available to test")
    
    def test_get_post_not_found(self):
        """GET /api/blog/posts/{slug_or_id} returns 404 for non-existent"""
        response = requests.get(f"{BASE_URL}/api/blog/posts/non-existent-slug-12345")
        assert response.status_code == 404


class TestPostStatusChange:
    """Test PUT /api/blog/posts/{post_id}/status"""
    
    def test_change_post_status_to_published(self):
        """PUT /api/blog/posts/{post_id}/status changes status to published"""
        # Find a pending post
        list_response = requests.get(f"{BASE_URL}/api/blog/posts", params={"status": "pending", "limit": 1})
        posts = list_response.json().get("posts", [])
        
        if posts:
            post_id = posts[0]["post_id"]
            
            # Change to published
            response = requests.put(
                f"{BASE_URL}/api/blog/posts/{post_id}/status",
                json={"status": "published"}
            )
            assert response.status_code == 200
            
            # Verify change
            verify = requests.get(f"{BASE_URL}/api/blog/posts/{post_id}")
            assert verify.json()["status"] == "published"
            assert verify.json().get("published_at") is not None, "published_at should be set"
            
            # Revert to pending for other tests
            requests.put(
                f"{BASE_URL}/api/blog/posts/{post_id}/status",
                json={"status": "pending"}
            )
        else:
            pytest.skip("No pending posts to test status change")
    
    def test_change_post_status_to_rejected(self):
        """PUT /api/blog/posts/{post_id}/status changes status to rejected"""
        list_response = requests.get(f"{BASE_URL}/api/blog/posts", params={"status": "pending", "limit": 1})
        posts = list_response.json().get("posts", [])
        
        if posts:
            post_id = posts[0]["post_id"]
            
            response = requests.put(
                f"{BASE_URL}/api/blog/posts/{post_id}/status",
                json={"status": "rejected"}
            )
            assert response.status_code == 200
            
            # Verify and revert
            verify = requests.get(f"{BASE_URL}/api/blog/posts/{post_id}")
            assert verify.json()["status"] == "rejected"
            
            requests.put(
                f"{BASE_URL}/api/blog/posts/{post_id}/status",
                json={"status": "pending"}
            )
        else:
            pytest.skip("No pending posts to test status change")
    
    def test_change_post_status_invalid(self):
        """PUT /api/blog/posts/{post_id}/status returns 400 for invalid status"""
        list_response = requests.get(f"{BASE_URL}/api/blog/posts", params={"status": "pending", "limit": 1})
        posts = list_response.json().get("posts", [])
        
        if posts:
            post_id = posts[0]["post_id"]
            
            response = requests.put(
                f"{BASE_URL}/api/blog/posts/{post_id}/status",
                json={"status": "invalid_status"}
            )
            assert response.status_code == 400


class TestBlogSitemap:
    """Test GET /api/blog/sitemap"""
    
    def test_get_sitemap(self):
        """GET /api/blog/sitemap returns published post slugs"""
        response = requests.get(f"{BASE_URL}/api/blog/sitemap")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Sitemap should be a list"
        
        # Each entry should have slug, published_at, category
        for entry in data:
            assert "slug" in entry, "Sitemap entry should have slug"
            assert "category" in entry, "Sitemap entry should have category"


class TestBlogPostDelete:
    """Test DELETE /api/blog/posts/{post_id}"""
    
    def test_delete_post(self):
        """DELETE /api/blog/posts/{post_id} deletes a post"""
        # We need a post to delete - find a rejected one or use status change
        list_response = requests.get(f"{BASE_URL}/api/blog/posts", params={"status": "rejected", "limit": 1})
        posts = list_response.json().get("posts", [])
        
        if posts:
            post_id = posts[0]["post_id"]
            
            response = requests.delete(f"{BASE_URL}/api/blog/posts/{post_id}")
            assert response.status_code == 200
            
            # Verify deleted
            verify = requests.get(f"{BASE_URL}/api/blog/posts/{post_id}")
            assert verify.status_code == 404
        else:
            # Skip if no rejected posts - don't delete pending/published
            pytest.skip("No rejected posts to safely delete")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
