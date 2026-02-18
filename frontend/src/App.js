import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Admin pages
import { AuthProvider, useAuth } from "./contexts/KBAuthContext";
import KBLoginPage from "./pages/admin/KBLoginPage";
import KBDashboard from "./pages/admin/KBDashboard";
import KBCategoriesPage from "./pages/admin/KBCategoriesPage";
import KBArticlesPage from "./pages/admin/KBArticlesPage";
import KBArticleEditor from "./pages/admin/KBArticleEditor";

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
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/services/:serviceId" element={<ServicePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-we-work" element={<HowWeWorkPage />} />
      <Route path="/case-studies" element={<CaseStudiesPage />} />
      <Route path="/services/email" element={<EmailSolutionsPage />} />
      <Route path="/services/cybersecurity" element={<CyberSecurityPage />} />
      <Route path="/kb" element={<KnowledgeBasePage />} />
      <Route path="/kb/category/:categorySlug" element={<KBCategoryPage />} />
      <Route path="/kb/article/:articleSlug" element={<KBArticlePage />} />

      {/* Admin Routes */}
      <Route path="/kb/admin/login" element={<KBLoginPage />} />
      <Route path="/kb/admin" element={
        <ProtectedRoute><KBDashboard /></ProtectedRoute>
      } />
      <Route path="/kb/admin/categories" element={
        <ProtectedRoute><KBCategoriesPage /></ProtectedRoute>
      } />
      <Route path="/kb/admin/articles" element={
        <ProtectedRoute><KBArticlesPage /></ProtectedRoute>
      } />
      <Route path="/kb/admin/articles/:articleId" element={
        <ProtectedRoute><KBArticleEditor /></ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
