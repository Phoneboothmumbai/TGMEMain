import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, kbApi } from '../../contexts/KBAuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Toaster } from '../../components/ui/sonner';
import {
  FolderTree, FileText, Eye, FilePlus, TrendingUp
} from 'lucide-react';

const KBDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await kbApi.getStats(token);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      label: 'Main Categories',
      value: stats.total_categories,
      icon: FolderTree,
      color: 'bg-blue-50 text-blue-600',
      link: '/kb/admin/categories'
    },
    {
      label: 'Subcategories',
      value: stats.total_subcategories,
      icon: FolderTree,
      color: 'bg-purple-50 text-purple-600',
      link: '/kb/admin/categories'
    },
    {
      label: 'Total Articles',
      value: stats.total_articles,
      icon: FileText,
      color: 'bg-amber-50 text-amber-600',
      link: '/kb/admin/articles'
    },
    {
      label: 'Published',
      value: stats.published_articles,
      icon: Eye,
      color: 'bg-green-50 text-green-600',
      link: '/kb/admin/articles?status=published'
    },
    {
      label: 'Drafts',
      value: stats.draft_articles,
      icon: FilePlus,
      color: 'bg-orange-50 text-orange-600',
      link: '/kb/admin/articles?status=draft'
    },
    {
      label: 'Total Views',
      value: stats.total_views.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-cyan-50 text-cyan-600'
    }
  ] : [];

  return (
    <AdminLayout>
      <Toaster position="top-right" richColors />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Knowledge Base overview and statistics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, idx) => (
            <Link key={idx} to={stat.link || '#'}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/kb/admin/categories">
            <Card className="hover:shadow-md hover:border-amber-200 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <FolderTree className="text-amber-600" size={24} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Manage Categories</p>
                  <p className="text-sm text-slate-500">Add, edit, or delete categories</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/kb/admin/articles/new">
            <Card className="hover:shadow-md hover:border-amber-200 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <FilePlus className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">New Article</p>
                  <p className="text-sm text-slate-500">Create a new KB article</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/kb" target="_blank">
            <Card className="hover:shadow-md hover:border-amber-200 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Eye className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">View Knowledge Base</p>
                  <p className="text-sm text-slate-500">See public KB pages</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default KBDashboard;
