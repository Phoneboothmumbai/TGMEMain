import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ServicePage from "./pages/ServicePage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import KBCategoryPage from "./pages/KBCategoryPage";
import KBArticlePage from "./pages/KBArticlePage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services/:serviceId" element={<ServicePage />} />
          <Route path="/kb" element={<KnowledgeBasePage />} />
          <Route path="/kb/:categoryId" element={<KBCategoryPage />} />
          <Route path="/kb/:categoryId/:articleId" element={<KBArticlePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
