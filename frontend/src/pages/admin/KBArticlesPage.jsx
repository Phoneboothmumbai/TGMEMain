import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth, kbApi } from '../../contexts/KBAuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Toaster } from '../../components/ui/sonner';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui/dialog';
import {
  Plus, Edit, Trash2, Search, Eye, EyeOff, FileText,
  Loader2, Filter, ChevronRight
} from 'lucide-react';

const KBArticlesPage = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterStatus, filterSubcategory]);

  const loadData = async () => {
    try {
      const [articlesRes, catsRes, subcatsRes] = await Promise.all([
        kbApi.getArticles(token, {
          status: filterStatus || undefined,
          subcategory_id: filterSubcategory || undefined,
          search: searchQuery || undefined
        }),
        kbApi.getCategories(token),
        kbApi.getSubcategories(token)
      ]);
      setArticles(articlesRes.data);
      setCategories(catsRes.data);
      setSubcategories(subcatsRes.data);
    } catch (error) {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await kbApi.deleteArticle(token, deleteModal.item.id);
      toast.success('Article deleted!');
      setDeleteModal({ open: false, item: null });
      loadData();
    } catch (error) {
      toast.error('Failed to delete article');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      await kbApi.updateArticle(token, article.id, { status: newStatus });
      toast.success(`Article ${newStatus === 'published' ? 'published' : 'unpublished'}!`);
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" richColors />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Articles</h1>
          <p className="text-slate-500">Manage knowledge base articles</p>
        </div>
        <Link to="/kb/admin/articles/new">
          <Button className="bg-amber-500 hover:bg-amber-600">
            <Plus size={18} className="mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="pl-10"
                />
              </div>
            </form>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={filterSubcategory}
              onChange={(e) => setFilterSubcategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <optgroup key={cat.id} label={cat.name}>
                  {subcategories
                    .filter(sub => sub.main_category_id === cat.id)
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))
                  }
                </optgroup>
              ))}
            </select>

            <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterStatus(''); setFilterSubcategory(''); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No articles found</p>
            <Link to="/kb/admin/articles/new">
              <Button className="bg-amber-500 hover:bg-amber-600">Create First Article</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {article.status}
                      </span>
                      {article.main_category_name && (
                        <span className="text-xs text-slate-400">
                          {article.main_category_name}
                          <ChevronRight size={12} className="inline mx-1" />
                          {article.subcategory_name}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/kb/admin/articles/${article.id}`}
                      className="font-medium text-slate-800 hover:text-amber-600 block truncate"
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-slate-500 truncate mt-1">
                      {article.excerpt || 'No excerpt'}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Updated: {new Date(article.updated_at).toLocaleDateString()} • {article.views || 0} views
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(article)}
                      title={article.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {article.status === 'published' ? (
                        <EyeOff size={16} className="text-orange-500" />
                      ) : (
                        <Eye size={16} className="text-green-500" />
                      )}
                    </Button>
                    <Link to={`/kb/admin/articles/${article.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteModal({ open: true, item: article })}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{deleteModal.item?.title}</strong>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ ...deleteModal, open: false })}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} disabled={saving} variant="destructive">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default KBArticlesPage;
