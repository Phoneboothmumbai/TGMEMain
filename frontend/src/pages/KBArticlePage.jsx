import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Toaster } from '../components/ui/sonner';
import { kbCategories, getArticleById } from '../data/knowledgeBase';
import {
  ArrowLeft, ChevronRight, Clock, Share2, Printer, BookOpen,
  Apple, Mail, IndianRupee, Info, Cpu, Wifi,
  FileText, Wrench, Scale, Download
} from 'lucide-react';
import { toast } from 'sonner';

const iconMap = {
  Apple,
  Mail,
  IndianRupee,
  Info,
  Cpu,
  Wifi,
  FileText,
  Wrench,
  Scale,
  Download,
  BookOpen
};

export default function KBArticlePage() {
  const { categoryId, articleId } = useParams();
  const category = kbCategories.find(c => c.id === categoryId);
  const article = getArticleById(categoryId, articleId);
  
  if (!category || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Article not found</h1>
          <Link to="/kb" className="text-amber-600 hover:underline">Back to Knowledge Base</Link>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[category.icon] || FileText;

  // Get related articles from same category
  const relatedArticles = category.articles
    .filter(a => a.id !== articleId)
    .slice(0, 3);

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
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Simple markdown-like rendering
  const renderContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-semibold text-slate-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold text-slate-800 mt-8 mb-4">{line.replace('## ', '')}</h2>;
      }
      // List items
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
        if (match) {
          return (
            <li key={idx} className="flex gap-2 mb-2">
              <span className="font-semibold text-slate-700">{match[1]}:</span>
              <span className="text-slate-600">{match[2]}</span>
            </li>
          );
        }
      }
      if (line.startsWith('- [ ]')) {
        return (
          <li key={idx} className="flex items-center gap-2 mb-2">
            <input type="checkbox" className="rounded border-slate-300" disabled />
            <span className="text-slate-600">{line.replace('- [ ] ', '')}</span>
          </li>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="flex gap-2 mb-2 ml-4">
            <span className="text-amber-500">•</span>
            <span className="text-slate-600">{line.replace('- ', '')}</span>
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)[1];
        const text = line.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="flex gap-3 mb-2 ml-4">
            <span className="text-amber-600 font-medium">{num}.</span>
            <span className="text-slate-600">{text}</span>
          </li>
        );
      }
      // Table rows
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim());
        if (cells.every(c => c.includes('---'))) {
          return null; // Skip separator row
        }
        const isHeader = lines[idx + 1]?.includes('---');
        return (
          <tr key={idx} className={isHeader ? 'bg-slate-50' : ''}>
            {cells.map((cell, cellIdx) => (
              isHeader ? (
                <th key={cellIdx} className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">
                  {cell.trim()}
                </th>
              ) : (
                <td key={cellIdx} className="px-4 py-2 text-sm text-slate-600 border border-slate-200">
                  {cell.trim()}
                </td>
              )
            ))}
          </tr>
        );
      }
      // Italic text
      if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={idx} className="text-slate-500 italic mt-4">{line.replace(/\*/g, '')}</p>;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-4" />;
      }
      // Regular paragraph
      return <p key={idx} className="text-slate-600 mb-2 leading-relaxed">{line}</p>;
    });
  };

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
              <Link to={`/kb/${categoryId}`} className="hover:text-amber-600 transition-colors">
                {category.title}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-800 truncate max-w-[200px]">{article.title}</span>
            </div>

            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm mb-4">
              <IconComponent className="w-4 h-4" />
              {category.title}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Last updated: {article.updatedAt}</span>
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
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-8">
                    <article className="prose prose-slate max-w-none">
                      {renderContent(article.content)}
                    </article>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                  <Link
                    to={`/kb/${categoryId}`}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {category.title}
                  </Link>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <Card className="bg-white border-slate-200 sticky top-24">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-800 mb-4">Related Articles</h3>
                      <ul className="space-y-3">
                        {relatedArticles.map((relArticle) => (
                          <li key={relArticle.id}>
                            <Link
                              to={`/kb/${categoryId}/${relArticle.id}`}
                              className="flex items-start gap-2 text-sm text-slate-600 hover:text-amber-600 transition-colors"
                            >
                              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{relArticle.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <Link
                          to={`/kb/${categoryId}`}
                          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                          View all in {category.title} →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Need Help */}
                <Card className="bg-amber-50 border-amber-100 mt-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-800 mb-2">Need more help?</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Contact our support team for personalized assistance.
                    </p>
                    <Link
                      to="/#contact"
                      className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Contact Support →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
