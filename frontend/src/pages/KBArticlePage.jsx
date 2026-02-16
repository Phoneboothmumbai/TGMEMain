import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import axios from 'axios';
import {
  ArrowLeft, ChevronRight, Clock, Share2, Printer, BookOpen,
  Folder, Loader2, Eye
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function KBArticlePage() {
  const { articleSlug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [articleSlug]);

  const loadArticle = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/kb/public/articles/${articleSlug}`);
      setArticle(response.data);
    } catch (error) {
      setError('Article not found');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: url
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
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
  
  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Article not found</h1>
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
        <section className="bg-white border-b border-slate-200 py-8">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
              <Link to="/kb" className="hover:text-amber-600 transition-colors">
                Knowledge Base
              </Link>
              <ChevronRight className="w-4 h-4" />
              {article.main_category && (
                <>
                  <Link 
                    to={`/kb/category/${article.main_category.slug}`} 
                    className="hover:text-amber-600 transition-colors"
                  >
                    {article.main_category.name}
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
              {article.subcategory && (
                <span className="text-slate-600">{article.subcategory.name}</span>
              )}
            </div>

            {/* Category Badge */}
            {article.main_category && (
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm mb-4">
                <Folder className="w-4 h-4" />
                {article.main_category.name}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(article.updated_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views || 0} views
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-8">
                <article 
                  className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-amber-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-6 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500">Tags:</span>
                {article.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Link
                to={article.main_category ? `/kb/category/${article.main_category.slug}` : '/kb'}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {article.subcategory?.name || 'Knowledge Base'}
              </Link>
            </div>

            {/* Need Help */}
            <Card className="bg-amber-50 border-amber-100 mt-8">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-slate-800 mb-2">Need more help?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Contact our support team for personalized assistance.
                </p>
                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
                >
                  Contact Support →
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
