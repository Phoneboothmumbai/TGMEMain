import React, { useState, useEffect } from 'react';
import { useAuth, kbApi } from '../../contexts/KBAuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
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
  Plus, Edit, Trash2, FolderPlus, ChevronRight, ChevronDown,
  Loader2, Folder, FileText
} from 'lucide-react';

const KBCategoriesPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Modal states
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'create', data: null });
  const [subcategoryModal, setSubcategoryModal] = useState({ open: false, mode: 'create', data: null, parentId: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, item: null });

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', icon: 'Folder', order: 0 });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', slug: '', description: '', order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catsRes, subcatsRes] = await Promise.all([
        kbApi.getCategories(token),
        kbApi.getSubcategories(token)
      ]);
      setCategories(catsRes.data);
      setSubcategories(subcatsRes.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Category handlers
  const openCategoryModal = (mode, category = null) => {
    if (mode === 'edit' && category) {
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || 'Folder',
        order: category.order || 0
      });
    } else {
      setCategoryForm({ name: '', slug: '', description: '', icon: 'Folder', order: 0 });
    }
    setCategoryModal({ open: true, mode, data: category });
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const slug = categoryForm.slug || generateSlug(categoryForm.name);
    setSaving(true);
    try {
      if (categoryModal.mode === 'create') {
        await kbApi.createCategory(token, { ...categoryForm, slug });
        toast.success('Category created!');
      } else {
        await kbApi.updateCategory(token, categoryModal.data.id, { ...categoryForm, slug });
        toast.success('Category updated!');
      }
      setCategoryModal({ open: false, mode: 'create', data: null });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  // Subcategory handlers
  const openSubcategoryModal = (mode, subcategory = null, parentId = null) => {
    if (mode === 'edit' && subcategory) {
      setSubcategoryForm({
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description || '',
        order: subcategory.order || 0
      });
      setSubcategoryModal({ open: true, mode, data: subcategory, parentId: subcategory.main_category_id });
    } else {
      setSubcategoryForm({ name: '', slug: '', description: '', order: 0 });
      setSubcategoryModal({ open: true, mode, data: null, parentId });
    }
  };

  const saveSubcategory = async () => {
    if (!subcategoryForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const slug = subcategoryForm.slug || generateSlug(subcategoryForm.name);
    setSaving(true);
    try {
      if (subcategoryModal.mode === 'create') {
        await kbApi.createSubcategory(token, {
          ...subcategoryForm,
          slug,
          main_category_id: subcategoryModal.parentId
        });
        toast.success('Subcategory created!');
      } else {
        await kbApi.updateSubcategory(token, subcategoryModal.data.id, { ...subcategoryForm, slug });
        toast.success('Subcategory updated!');
      }
      setSubcategoryModal({ open: false, mode: 'create', data: null, parentId: null });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save subcategory');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const confirmDelete = async () => {
    setSaving(true);
    try {
      if (deleteModal.type === 'category') {
        await kbApi.deleteCategory(token, deleteModal.item.id);
        toast.success('Category deleted!');
      } else {
        await kbApi.deleteSubcategory(token, deleteModal.item.id);
        toast.success('Subcategory deleted!');
      }
      setDeleteModal({ open: false, type: null, item: null });
      loadData();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(sc => sc.main_category_id === categoryId);
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" richColors />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-slate-500">Manage main categories and subcategories</p>
        </div>
        <Button onClick={() => openCategoryModal('create')} className="bg-amber-500 hover:bg-amber-600">
          <Plus size={18} className="mr-2" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Folder className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No categories yet</p>
            <Button onClick={() => openCategoryModal('create')} className="bg-amber-500 hover:bg-amber-600">
              Create First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const subs = getSubcategoriesForCategory(category.id);
            const isExpanded = expandedCategories[category.id];

            return (
              <Card key={category.id}>
                <CardContent className="p-0">
                  {/* Category Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <Folder className="text-amber-500" size={20} />
                      <div>
                        <p className="font-medium text-slate-800">{category.name}</p>
                        <p className="text-sm text-slate-500">
                          {subs.length} subcategories • {category.article_count || 0} articles
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openSubcategoryModal('create', null, category.id)}
                      >
                        <FolderPlus size={16} className="mr-1" />
                        Add Sub
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCategoryModal('edit', category)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setDeleteModal({ open: true, type: 'category', item: category })}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {isExpanded && subs.length > 0 && (
                    <div className="border-t border-slate-100">
                      {subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-4 pl-12 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <Folder className="text-slate-400" size={18} />
                            <div>
                              <p className="font-medium text-slate-700">{sub.name}</p>
                              <p className="text-sm text-slate-500">{sub.article_count || 0} articles</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSubcategoryModal('edit', sub)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeleteModal({ open: true, type: 'subcategory', item: sub })}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && subs.length === 0 && (
                    <div className="border-t border-slate-100 p-4 pl-12 text-slate-500 text-sm">
                      No subcategories. <button onClick={() => openSubcategoryModal('create', null, category.id)} className="text-amber-600 hover:underline">Add one</button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      <Dialog open={categoryModal.open} onOpenChange={(open) => setCategoryModal({ ...categoryModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryModal.mode === 'create' ? 'Create Category' : 'Edit Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Legal & Important Docs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <Input
                value={categoryForm.slug || generateSlug(categoryForm.name)}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                placeholder="auto-generated-from-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Order</label>
              <Input
                type="number"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryModal({ ...categoryModal, open: false })}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {categoryModal.mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Modal */}
      <Dialog open={subcategoryModal.open} onOpenChange={(open) => setSubcategoryModal({ ...subcategoryModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {subcategoryModal.mode === 'create' ? 'Create Subcategory' : 'Edit Subcategory'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={subcategoryForm.name}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                placeholder="e.g., Terms & Conditions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <Input
                value={subcategoryForm.slug || generateSlug(subcategoryForm.name)}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })}
                placeholder="auto-generated-from-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={subcategoryForm.description}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                placeholder="Brief description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Order</label>
              <Input
                type="number"
                value={subcategoryForm.order}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryModal({ ...subcategoryModal, open: false })}>
              Cancel
            </Button>
            <Button onClick={saveSubcategory} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {subcategoryModal.mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{deleteModal.item?.name}</strong>?
            {deleteModal.type === 'category' && (
              <span className="block text-red-600 text-sm mt-2">
                This will also delete all subcategories and articles within it.
              </span>
            )}
            {deleteModal.type === 'subcategory' && (
              <span className="block text-red-600 text-sm mt-2">
                This will also delete all articles within it.
              </span>
            )}
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

export default KBCategoriesPage;
