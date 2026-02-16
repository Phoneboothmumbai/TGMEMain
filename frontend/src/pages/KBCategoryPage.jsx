import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Toaster } from '../components/ui/sonner';
import { kbCategories } from '../data/knowledgeBase';
import {
  ArrowLeft, ChevronRight, BookOpen, Clock,
  Apple, Mail, IndianRupee, Info, Cpu, Wifi,
  FileText, Wrench, Scale, Download
} from 'lucide-react';

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

export default function KBCategoryPage() {
  const { categoryId } = useParams();
  const category = kbCategories.find(c => c.id === categoryId);
  
  if (!category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Category not found</h1>
          <Link to="/kb" className="text-amber-600 hover:underline">Back to Knowledge Base</Link>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[category.icon] || FileText;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <Header />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="bg-white border-b border-slate-200 py-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <Link to="/kb" className="hover:text-amber-600 transition-colors">
                Knowledge Base
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-800">{category.title}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                <IconComponent className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  {category.title}
                </h1>
                <p className="text-slate-600">
                  {category.description}
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  {category.articles.length} article{category.articles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Articles List */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="space-y-4">
              {category.articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/kb/${categoryId}/${article.id}`}
                  className="block group"
                >
                  <Card className="bg-white border-slate-200 transition-all duration-300 hover:shadow-md hover:border-amber-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                          <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-500 mb-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>Updated {article.updatedAt}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

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
