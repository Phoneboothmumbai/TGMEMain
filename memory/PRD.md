# TGME Website - Product Requirements Document

## Original Problem Statement
Build a comprehensive website for "The Good Men Enterprise (TGME)" technology solutions company. The project includes:
1. A professional, modern, light-themed website
2. A landing page covering company value proposition, services, differentiators, clients, philosophy, and contact form
3. Seven detailed, individual pages for each of TGME's services
4. A feature-rich Knowledge Base (KB) with a full backend Content Management System (CMS)

## User Personas
- **TGME Administrators**: Need to manage KB content (categories, subcategories, articles) via admin panel
- **Website Visitors**: Need to browse services, read KB articles, search for information, contact company

## Core Requirements

### Marketing Website (COMPLETED)
- [x] Landing page with hero, services overview, why us section, contact form
- [x] 7 detailed service pages with inter-page navigation
- [x] Light theme across all components
- [x] Responsive design
- [x] Header with navigation
- [x] Footer with service links

### Knowledge Base CMS (COMPLETED)
- [x] **Admin Authentication**: Setup/login with JWT tokens
- [x] **Category Management**: CRUD for main categories (name, slug, description, icon, order)
- [x] **Subcategory Management**: CRUD for subcategories under main categories
- [x] **Article Management**: CRUD with rich text editor (Tiptap.js)
- [x] **Article Features**: Title, slug, excerpt, content, tags, status (draft/published), order
- [x] **Image Upload**: Upload images for articles
- [x] **Statistics Dashboard**: View KB stats (categories, articles, views)
- [x] **Public KB Pages**: Browse categories, view articles, search functionality

## Technical Architecture

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` - Main FastAPI application
- `/app/backend/kb_routes.py` - KB API endpoints
- `/app/backend/kb_models.py` - Pydantic models

### Frontend (React + TailwindCSS + Shadcn UI)
- `/app/frontend/src/App.js` - Main router
- `/app/frontend/src/contexts/KBAuthContext.jsx` - Auth context and API service
- `/app/frontend/src/pages/admin/` - Admin panel pages
- `/app/frontend/src/pages/` - Public pages (Landing, Service, KB)
- `/app/frontend/src/components/admin/` - AdminLayout, RichTextEditor

### Database Collections (MongoDB)
- `kb_admins` - Admin users
- `kb_main_categories` - Main categories
- `kb_subcategories` - Subcategories
- `kb_articles` - Articles

## API Endpoints

### Admin (Protected)
- `POST /api/kb/admin/setup` - Create initial admin
- `POST /api/kb/admin/login` - Login
- `GET /api/kb/admin/me` - Current admin info
- `GET/POST/PUT/DELETE /api/kb/admin/categories`
- `GET/POST/PUT/DELETE /api/kb/admin/subcategories`
- `GET/POST/PUT/DELETE /api/kb/admin/articles`
- `POST /api/kb/admin/upload` - Image upload
- `GET /api/kb/admin/stats` - Statistics

### Public
- `GET /api/kb/public/categories` - All categories with subcategories
- `GET /api/kb/public/categories/{slug}` - Single category
- `GET /api/kb/public/subcategories/{slug}/articles` - Articles in subcategory
- `GET /api/kb/public/articles/{slug}` - Single article
- `GET /api/kb/public/search?q=query` - Search articles

## Test Credentials
- **Admin Username**: testadmin
- **Admin Password**: testpass123

## Completed Tasks (December 2025)
1. [x] Marketing website foundation with light theme
2. [x] Landing page with all sections
3. [x] 7 detailed service pages
4. [x] Knowledge Base CMS backend (API + database models)
5. [x] Admin panel (login, dashboard, categories, articles, rich text editor)
6. [x] Public KB pages (categories, articles, search)
7. [x] Testing and bug fixes (MongoDB _id handling, import paths)

## Pending Tasks

### P1 - Upcoming
1. [ ] **Contact Form Backend** - Implement `/api/contact` to save leads to database
2. [ ] **Services Dropdown Menu** - Add dropdown navigation for services in header

### P2 - Pending
3. [ ] **Static Pages** - About TGME, How We Work, Case Studies

### P3/P4 - Future/Backlog
4. [ ] Smart IT Setup Wizard (lead qualification tool)
5. [ ] Interactive service tools (Infrastructure Planner, Network Visualizer)

## Files of Reference
- Backend: `/app/backend/kb_routes.py`, `/app/backend/kb_models.py`, `/app/backend/server.py`
- Admin Frontend: `/app/frontend/src/pages/admin/`, `/app/frontend/src/components/admin/`
- Public Frontend: `/app/frontend/src/pages/KnowledgeBasePage.jsx`, `/app/frontend/src/pages/KBCategoryPage.jsx`, `/app/frontend/src/pages/KBArticlePage.jsx`
- Auth Context: `/app/frontend/src/contexts/KBAuthContext.jsx`
