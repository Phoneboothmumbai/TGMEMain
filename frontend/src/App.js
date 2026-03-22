import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { WhatsAppWidget } from "./components/WhatsAppWidget";
import LandingPage from "./pages/LandingPage";
import ServicePage from "./pages/ServicePage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import KBCategoryPage from "./pages/KBCategoryPage";
import KBArticlePage from "./pages/KBArticlePage";
import AboutPage from "./pages/AboutPage";
import HowWeWorkPage from "./pages/HowWeWorkPage";
import CaseStudiesPage from "./pages/CaseStudiesPage";
import EmailSolutionsPage from "./pages/EmailSolutionsPage";
import CyberSecurityPage from "./pages/CyberSecurityPage";
import HardwareRepairPage from "./pages/HardwareRepairPage";
import AMCPage from "./pages/AMCPage";
import SupportFormPage from "./pages/SupportFormPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import SEOLandingPage from "./pages/SEOLandingPage";
import BusinessCardPage from "./pages/BusinessCardPage";

// Admin pages
import { AuthProvider, useAuth } from "./contexts/KBAuthContext";
import KBLoginPage from "./pages/admin/KBLoginPage";
import KBDashboard from "./pages/admin/KBDashboard";
import KBCategoriesPage from "./pages/admin/KBCategoriesPage";
import KBArticlesPage from "./pages/admin/KBArticlesPage";
import KBArticleEditor from "./pages/admin/KBArticleEditor";

// Workspace / ServiceBook
import { WorkspaceAuthProvider } from "./contexts/WorkspaceAuthContext";
import WorkspaceLoginPage from "./pages/workspace/WorkspaceLoginPage";
import ServiceBookLayout from "./pages/workspace/ServiceBookLayout";
import ServiceBookDashboard from "./pages/workspace/ServiceBookDashboard";
import ClientsPage from "./pages/workspace/ClientsPage";
import EmployeesPage from "./pages/workspace/EmployeesPage";
import PartsPage from "./pages/workspace/PartsPage";
import TasksPage from "./pages/workspace/TasksPage";
import ServiceEntriesPage from "./pages/workspace/ServiceEntriesPage";
import BillingPage from "./pages/workspace/BillingPage";
import PartsRequestsPage from "./pages/workspace/PartsRequestsPage";
import ExpensesPage from "./pages/workspace/ExpensesPage";
import BlogAdminPage from "./pages/workspace/BlogAdminPage";
import MyTasksPage from "./pages/workspace/MyTasksPage";
import TaskDetailPage from "./pages/workspace/TaskDetailPage";
import TaskWorkflowPage from "./pages/workspace/TaskWorkflowPage";
import MyExpensesPage from "./pages/workspace/MyExpensesPage";
import RequestPartsPage from "./pages/workspace/RequestPartsPage";
import SuppliersPage from "./pages/workspace/SuppliersPage";
import AssetsPage from "./pages/workspace/AssetsPage";
import AMCManagementPage from "./pages/workspace/AMCManagementPage";
import LicensesPage from "./pages/workspace/LicensesPage";
import PortalUsersPage from "./pages/workspace/PortalUsersPage";
import LeadDashboardPage from "./pages/workspace/LeadDashboardPage";
import SalesLayout from "./pages/workspace/SalesLayout";
import SalesDashboard from "./pages/workspace/SalesDashboard";
import ScraperPage from "./pages/workspace/ScraperPage";
import VisitorAnalyticsPage from "./pages/workspace/VisitorAnalyticsPage";
import SalesPipelinePage from "./pages/workspace/SalesPipelinePage";
import AccountsPage from "./pages/workspace/AccountsPage";
import SalesContactsPage from "./pages/workspace/ContactsPage";
import LeadDetailPage from "./pages/workspace/LeadDetailPage";
import AdminLayout from "./pages/workspace/AdminLayout";
import AdminDashboard from "./pages/workspace/AdminDashboard";
import EmployeeManagementPage from "./pages/workspace/EmployeeManagementPage";

// Client Portal
import { PortalAuthProvider } from "./contexts/PortalAuthContext";
import PortalLoginPage from "./pages/portal/PortalLoginPage";
import PortalLayout from "./pages/portal/PortalLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalAssetsPage from "./pages/portal/PortalAssetsPage";
import PortalContactsPage from "./pages/portal/PortalContactsPage";
import PortalAMCsPage from "./pages/portal/PortalAMCsPage";
import PortalTicketsPage from "./pages/portal/PortalTicketsPage";
import PortalRaiseTicketPage from "./pages/portal/PortalRaiseTicketPage";
import { useVisitorTracking } from "./hooks/useVisitorTracking";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/kb/admin/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  useVisitorTracking();
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/services/:serviceId" element={<ServicePage />} />

      {/* SEO Service Landing Pages */}
      <Route path="/services/cctv-installation" element={<SEOLandingPage type="service" slug="cctv-installation" />} />
      <Route path="/services/networking" element={<SEOLandingPage type="service" slug="networking" />} />
      <Route path="/services/server-solutions" element={<SEOLandingPage type="service" slug="server-solutions" />} />
      <Route path="/services/printer-repair" element={<SEOLandingPage type="service" slug="printer-repair" />} />
      <Route path="/services/ups-solutions" element={<SEOLandingPage type="service" slug="ups-solutions" />} />
      <Route path="/services/data-backup" element={<SEOLandingPage type="service" slug="data-backup" />} />
      <Route path="/services/apple-repair" element={<SEOLandingPage type="service" slug="apple-repair" />} />
      <Route path="/services/firewall-security" element={<SEOLandingPage type="service" slug="firewall-security" />} />
      <Route path="/services/apple-mac-ipad-bulk" element={<SEOLandingPage type="service" slug="apple-mac-ipad-bulk" />} />

      {/* SEO Location Landing Pages */}
      <Route path="/it-support-mumbai" element={<SEOLandingPage type="location" slug="it-support-mumbai" />} />
      <Route path="/computer-repair-mumbai" element={<SEOLandingPage type="location" slug="computer-repair-mumbai" />} />
      <Route path="/it-support-small-business" element={<SEOLandingPage type="location" slug="it-support-small-business" />} />
      <Route path="/it-services-mulund-thane" element={<SEOLandingPage type="location" slug="it-services-mulund-thane" />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-we-work" element={<HowWeWorkPage />} />
      <Route path="/case-studies" element={<CaseStudiesPage />} />
      <Route path="/services/email" element={<EmailSolutionsPage />} />
      <Route path="/services/cybersecurity" element={<CyberSecurityPage />} />
      <Route path="/services/repair" element={<HardwareRepairPage />} />
      <Route path="/amc" element={<AMCPage />} />
      <Route path="/card" element={<BusinessCardPage />} />
      <Route path="/support" element={<SupportFormPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/preview/:slug" element={<BlogPostPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/kb" element={<KnowledgeBasePage />} />
      <Route path="/kb/category/:categorySlug" element={<KBCategoryPage />} />
      <Route path="/kb/article/:articleSlug" element={<KBArticlePage />} />

      {/* KB Admin Routes */}
      <Route path="/kb/admin/login" element={<KBLoginPage />} />
      <Route path="/kb/admin" element={<ProtectedRoute><KBDashboard /></ProtectedRoute>} />
      <Route path="/kb/admin/categories" element={<ProtectedRoute><KBCategoriesPage /></ProtectedRoute>} />
      <Route path="/kb/admin/articles" element={<ProtectedRoute><KBArticlesPage /></ProtectedRoute>} />
      <Route path="/kb/admin/articles/:articleId" element={<ProtectedRoute><KBArticleEditor /></ProtectedRoute>} />

      {/* Workspace Routes */}
      <Route path="/workspace/login" element={<WorkspaceLoginPage />} />
      <Route path="/workspace/servicebook" element={<ServiceBookLayout />}>
        <Route index element={<ServiceBookDashboard />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="parts" element={<PartsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="amc-management" element={<AMCManagementPage />} />
        <Route path="licenses" element={<LicensesPage />} />
        <Route path="portal-users" element={<PortalUsersPage />} />
        <Route path="service-entries" element={<ServiceEntriesPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="parts-requests" element={<PartsRequestsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="blog-admin" element={<BlogAdminPage />} />
        <Route path="task/:taskId" element={<TaskWorkflowPage />} />
        <Route path="my-tasks" element={<MyTasksPage />} />
        <Route path="field-task/:taskId" element={<TaskDetailPage />} />
        <Route path="my-expenses" element={<MyExpensesPage />} />
        <Route path="request-parts" element={<RequestPartsPage />} />
      </Route>

      {/* Sales CRM Routes */}
      <Route path="/workspace/sales" element={<SalesLayout />}>
        <Route index element={<SalesDashboard />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="contacts" element={<SalesContactsPage />} />
        <Route path="leads" element={<LeadDashboardPage />} />
        <Route path="leads/:leadId" element={<LeadDetailPage />} />
        <Route path="scraper" element={<ScraperPage />} />
        <Route path="visitors" element={<VisitorAnalyticsPage />} />
        <Route path="pipeline" element={<SalesPipelinePage />} />
      </Route>

      {/* Admin Command Centre Routes */}
      <Route path="/workspace/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="employees" element={<EmployeeManagementPage />} />
      </Route>

      {/* Client Portal Routes */}
      <Route path="/portal/login" element={<PortalLoginPage />} />
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<PortalDashboard />} />
        <Route path="dashboard" element={<PortalDashboard />} />
        <Route path="assets" element={<PortalAssetsPage />} />
        <Route path="contacts" element={<PortalContactsPage />} />
        <Route path="amcs" element={<PortalAMCsPage />} />
        <Route path="tickets" element={<PortalTicketsPage />} />
        <Route path="raise-ticket" element={<PortalRaiseTicketPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceAuthProvider>
            <PortalAuthProvider>
            <AppRoutes />
            <WhatsAppWidget />
            </PortalAuthProvider>
          </WorkspaceAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
    </HelmetProvider>
  );
}

export default App;
