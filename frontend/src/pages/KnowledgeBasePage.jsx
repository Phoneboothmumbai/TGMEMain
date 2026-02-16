import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Toaster } from '../components/ui/sonner';
import axios from 'axios';
import {
  Search, Folder, ChevronRight, ArrowRight, BookOpen, Loader2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function KnowledgeBasePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/kb/public/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      setIsSearching(true);
      setSearching(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/kb/public/search`, {
          params: { q: query }
        });
        setSearchResults(response.data);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Get total article count
  const totalArticles = categories.reduce((sum, cat) => sum + (cat.article_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Knowledge Base
            </h1>
            <p className="text-slate-600 text-lg mb-8">
              Find answers to common questions, troubleshooting guides, and helpful resources.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for articles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            {/* Search Results */}
            {isSearching && (
              <div className="mt-4 text-left max-w-2xl mx-auto">
                <Card className="bg-white border-slate-200 shadow-lg">
                  <CardContent className="p-4">
                    {searching ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <p className="text-sm text-slate-500 mb-3">
                          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        <ul className="space-y-2">
                          {searchResults.slice(0, 5).map((article) => (
                            <li key={article.id}>
                              <Link
                                to={`/kb/article/${article.slug}`}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <ChevronRight className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-slate-800">{article.title}</p>
                                  <p className="text-sm text-slate-500">
                                    {article.main_category_name} → {article.subcategory_name}
                                  </p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        {searchResults.length > 5 && (
                          <p className="text-sm text-slate-400 mt-3 text-center">
                            +{searchResults.length - 5} more results
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-500 text-center py-4">
                        No articles found for "{searchQuery}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Browse by Category</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : categories.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Folder className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No categories available yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/kb/category/${category.slug}`}
                    className="block group"
                  >
                    <Card className="h-full bg-white border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-amber-500/30 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <Folder className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-slate-500 mb-3">
                              {category.description}
                            </p>
                            <span className="text-xs text-amber-600 font-medium">
                              {category.article_count || 0} article{category.article_count !== 1 ? 's' : ''}
                            </span>
                            {category.subcategories && category.subcategories.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-400 mb-2">{category.subcategories.length} subcategories:</p>
                                <div className="flex flex-wrap gap-1">
                                  {category.subcategories.slice(0, 3).map(sub => (
                                    <span key={sub.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                      {sub.name}
                                    </span>
                                  ))}
                                  {category.subcategories.length > 3 && (
                                    <span className="text-xs text-slate-400">+{category.subcategories.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-slate-600 mb-6">
              Our support team is here to help you with any questions.
            </p>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
