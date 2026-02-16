import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Toaster } from '../components/ui/sonner';
import axios from 'axios';
import {
  ArrowLeft, ChevronRight, BookOpen, Clock, Folder, Loader2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function KBCategoryPage() {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [categorySlug]);

  useEffect(() => {
    if (selectedSubcategory) {
      loadArticles(selectedSubcategory.slug);
    }
  }, [selectedSubcategory]);

  const loadCategory = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/kb/public/categories/${categorySlug}`);
      setCategory(response.data);
      // Auto-select first subcategory if exists
      if (response.data.subcategories && response.data.subcategories.length > 0) {
        setSelectedSubcategory(response.data.subcategories[0]);
      }
    } catch (error) {
      setError('Category not found');
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async (subcategorySlug) => {
    setLoadingArticles(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/kb/public/subcategories/${subcategorySlug}/articles`);
      setArticles(response.data.articles || []);
    } catch (error) {
      setArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-20">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Category not found</h1>
          <Link to="/kb" className="text-amber-600 hover:underline">Back to Knowledge Base</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <Header />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="bg-white border-b border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <Link to="/kb" className="hover:text-amber-600 transition-colors">
                Knowledge Base
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-800">{category.name}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                <Folder className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  {category.name}
                </h1>
                <p className="text-slate-600">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {category.subcategories && category.subcategories.length > 0 ? (
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Subcategories Sidebar */}
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-slate-800 mb-4">Subcategories</h3>
                  <nav className="space-y-1">
                    {category.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedSubcategory?.id === sub.id
                            ? 'bg-amber-50 text-amber-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block">{sub.name}</span>
                        <span className="text-xs text-slate-400">{sub.article_count || 0} articles</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Articles List */}
                <div className="lg:col-span-3">
                  {selectedSubcategory && (
                    <>
                      <h3 className="font-semibold text-slate-800 mb-4">
                        {selectedSubcategory.name}
                      </h3>
                      
                      {loadingArticles ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                        </div>
                      ) : articles.length === 0 ? (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No articles in this subcategory yet.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {articles.map((article) => (
                            <Link
                              key={article.id}
                              to={`/kb/article/${article.slug}`}
                              className="block group"
                            >
                              <Card className="bg-white border-slate-200 transition-all duration-300 hover:shadow-md hover:border-amber-500/30">
                                <CardContent className="p-5">
                                  <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                                      <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">
                                        {article.title}
                                      </h4>
                                      <p className="text-sm text-slate-500 mb-2">
                                        {article.excerpt || 'No excerpt available'}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {new Date(article.updated_at).toLocaleDateString()}
                                        </span>
                                        <span>{article.views || 0} views</span>
                                      </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Folder className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No subcategories in this category yet.</p>
                </CardContent>
              </Card>
            )}

            {/* Back Link */}
            <div className="mt-8">
              <Link
                to="/kb"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Knowledge Base
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
