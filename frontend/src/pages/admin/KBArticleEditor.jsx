import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, kbApi } from '../../contexts/KBAuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Toaster } from '../../components/ui/sonner';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';

const KBArticleEditor = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isNew = articleId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    subcategory_id: '',
    status: 'draft',
    tags: [],
    order: 0
  });

  useEffect(() => {
    loadCategories();
    if (!isNew) {
      loadArticle();
    }
  }, [articleId]);

  const loadCategories = async () => {
    try {
      const [catsRes, subcatsRes] = await Promise.all([
        kbApi.getCategories(token),
        kbApi.getSubcategories(token)
      ]);
      setCategories(catsRes.data);
      setSubcategories(subcatsRes.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const loadArticle = async () => {
    try {
      const response = await kbApi.getArticle(token, articleId);
      const article = response.data;
      setForm({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        subcategory_id: article.subcategory_id || '',
        status: article.status || 'draft',
        tags: article.tags || [],
        order: article.order || 0
      });
    } catch (error) {
      toast.error('Failed to load article');
      navigate('/kb/admin/articles');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = async (asDraft = false) => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.subcategory_id) {
      toast.error('Please select a category');
      return;
    }

    setSaving(true);
    const slug = form.slug || generateSlug(form.title);
    const data = {
      ...form,
      slug,
      status: asDraft ? 'draft' : form.status
    };

    try {
      if (isNew) {
        const response = await kbApi.createArticle(token, data);
        toast.success('Article created!');
        navigate(`/kb/admin/articles/${response.data.id}`);
      } else {
        await kbApi.updateArticle(token, articleId, data);
        toast.success('Article saved!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setForm({ ...form, status: 'published' });
    await handleSave(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/kb/admin/articles')}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-slate-800">
            {isNew ? 'New Article' : 'Edit Article'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            <Eye size={16} className="mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title *
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Article title"
                className="text-lg font-medium"
              />
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Content
              </label>
              <RichTextEditor
                content={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Write your article content here..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category *
              </label>
              <select
                value={form.subcategory_id}
                onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Select category</option>
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
              {subcategories.length === 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  No subcategories. Create one in Categories first.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Slug */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL Slug
              </label>
              <Input
                value={form.slug || generateSlug(form.title)}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="article-url-slug"
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave empty to auto-generate from title
              </p>
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Excerpt
              </label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Brief description for search results..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags
              </label>
              <Input
                value={form.tags.join(', ')}
                onChange={(e) => setForm({
                  ...form,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-slate-500 mt-1">
                Comma-separated
              </p>
            </CardContent>
          </Card>

          {/* Order */}
          <Card>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Display Order
              </label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-slate-500 mt-1">
                Lower numbers appear first
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default KBArticleEditor;
