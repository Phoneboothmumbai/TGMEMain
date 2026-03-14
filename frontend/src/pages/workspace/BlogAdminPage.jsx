import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import {
  Loader2, Plus, Check, X, Eye, Trash2, RefreshCw, Sparkles,
  FileText, Clock, CheckCircle2, XCircle, AlertCircle, Settings, Calendar,
  Zap, Timer
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: AlertCircle },
  published: { label: 'Published', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export default function BlogAdminPage() {
  const { employee } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [genCategory, setGenCategory] = useState('');
  const [genTopic, setGenTopic] = useState('');
  const [categories, setCategories] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [schedulerInfo, setSchedulerInfo] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsRes, settingsRes, schedulerRes, ...statusResults] = await Promise.all([
        fetch(`${API_URL}/api/blog/categories`),
        fetch(`${API_URL}/api/blog/settings`),
        fetch(`${API_URL}/api/blog/scheduler-status`),
        fetch(`${API_URL}/api/blog/posts?status=pending&limit=100`),
        fetch(`${API_URL}/api/blog/posts?status=published&limit=100`),
        fetch(`${API_URL}/api/blog/posts?status=rejected&limit=100`),
      ]);
      setCategories(await catsRes.json());
      setSettings(await settingsRes.json());
      setSchedulerInfo(await schedulerRes.json());

      const allPosts = [];
      for (const res of statusResults) {
        const data = await res.json();
        allPosts.push(...(data.posts || []));
      }
      allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPosts(allPosts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const params = new URLSearchParams();
      if (genCategory && genCategory.trim()) params.set('category', genCategory);
      if (genTopic) params.set('topic', genTopic);
      const res = await fetch(`${API_URL}/api/blog/generate?${params}`, { method: 'POST' });
      const data = await res.json();
      if (data.post) {
        toast.success(`Generated: "${data.post.title}"`);
        setGenTopic('');
        loadData();
      } else {
        toast.error(data.detail || 'Generation failed');
      }
    } catch (e) { toast.error('Generation failed'); }
    finally { setGenerating(false); }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/blog/posts/${postId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Post ${newStatus}`);
      loadData();
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await fetch(`${API_URL}/api/blog/posts/${postId}`, { method: 'DELETE' });
      toast.success('Post deleted');
      loadData();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(`${API_URL}/api/blog/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        toast.success('Settings saved');
        // Refresh scheduler info
        const schedRes = await fetch(`${API_URL}/api/blog/scheduler-status`);
        setSchedulerInfo(await schedRes.json());
      } else {
        toast.error(data.detail || 'Failed to save');
      }
    } catch (e) { toast.error('Failed to save settings'); }
    finally { setSavingSettings(false); }
  };

  const toggleDay = (day) => {
    const current = settings?.preferred_days || [];
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    if (updated.length === 0) return; // At least one day required
    setSettings({ ...settings, preferred_days: updated, posts_per_week: updated.length });
  };

  const handlePostsPerWeekChange = (value) => {
    const num = parseInt(value);
    // Auto-select evenly spaced days
    const step = Math.max(1, Math.floor(7 / num));
    const selectedDays = [];
    for (let i = 0; i < num && i < 7; i++) {
      selectedDays.push(DAYS[(i * step) % 7]);
    }
    setSettings({ ...settings, posts_per_week: num, preferred_days: selectedDays });
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter);
  const counts = { all: posts.length, pending: posts.filter(p => p.status === 'pending').length, published: posts.filter(p => p.status === 'published').length, rejected: posts.filter(p => p.status === 'rejected').length };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6" data-testid="blog-admin-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Blog Manager</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline" size="sm" data-testid="settings-toggle-btn">
            <Settings className="w-3.5 h-3.5 mr-1" /> Settings
          </Button>
          <Button onClick={loadData} variant="outline" size="sm"><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && settings && (
        <Card className="border-slate-200 bg-white shadow-sm" data-testid="blog-settings-panel">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Auto-Generation Settings</h2>
            </div>

            <div className="space-y-5">
              {/* Auto-generate toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-700 text-sm">Auto-Generate Blog Posts</p>
                  <p className="text-xs text-slate-500 mt-0.5">AI will automatically create new posts on schedule</p>
                </div>
                <Switch
                  data-testid="auto-generate-toggle"
                  checked={settings.auto_generate_enabled}
                  onCheckedChange={(v) => setSettings({ ...settings, auto_generate_enabled: v })}
                />
              </div>

              {/* Posts per week */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Posts Per Week</label>
                <Select value={String(settings.posts_per_week)} onValueChange={handlePostsPerWeekChange}>
                  <SelectTrigger className="w-48 h-9 text-sm" data-testid="posts-per-week-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} post{n > 1 ? 's' : ''} / week</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Days */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Publish Days</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map(day => (
                    <button key={day} onClick={() => toggleDay(day)}
                      data-testid={`day-toggle-${day}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        settings.preferred_days?.includes(day)
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                      }`}>
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Hour */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Generation Time</label>
                <Select value={String(settings.preferred_hour)} onValueChange={(v) => setSettings({ ...settings, preferred_hour: parseInt(v) })}>
                  <SelectTrigger className="w-48 h-9 text-sm" data-testid="preferred-hour-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduler status */}
              {schedulerInfo && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Scheduler: {schedulerInfo.scheduler_running ? 'Running' : 'Stopped'}</span>
                    <span className={`w-2 h-2 rounded-full ${schedulerInfo.scheduler_running ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  {schedulerInfo.next_run && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Next run: {new Date(schedulerInfo.next_run).toLocaleString()}</span>
                    </div>
                  )}
                  {!schedulerInfo.job_active && (
                    <p className="text-slate-400 italic">Auto-generation is currently off</p>
                  )}
                </div>
              )}

              <Button onClick={handleSaveSettings} disabled={savingSettings}
                className="bg-slate-800 hover:bg-slate-900 text-white h-9 text-sm" data-testid="save-settings-btn">
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Section */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-amber-800">AI Blog Generator</h2>
            {generating && <span className="text-xs text-amber-600 ml-auto animate-pulse">This may take 30-60 seconds...</span>}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={genCategory} onValueChange={setGenCategory}>
              <SelectTrigger className="flex-1 h-9 text-sm"><SelectValue placeholder="Category (random if empty)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Random Category</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={genTopic} onChange={e => setGenTopic(e.target.value)}
              placeholder="Topic hint (optional)" className="flex-1 h-9 text-sm" />
            <Button onClick={handleGenerate} disabled={generating}
              className="bg-amber-500 hover:bg-amber-600 text-white h-9" data-testid="generate-btn">
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {generating ? 'Generating...' : 'Generate Post'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'published', label: 'Published' },
          { key: 'rejected', label: 'Rejected' },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === t.key ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {/* Posts List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No posts found. Generate one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => {
            const sc = statusConfig[post.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <Card key={post.post_id} className="border-slate-200 hover:border-slate-300 transition-colors" data-testid={`blog-post-${post.post_id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" />{sc.label}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{post.category}</span>
                        <span className="text-[10px] text-slate-400"><Clock className="w-3 h-3 inline mr-0.5" />{post.reading_time} min | {post.word_count} words</span>
                        {post.auto_generated && (
                          <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Zap className="w-3 h-3 inline mr-0.5" />Auto
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-1">{post.title}</h3>
                      <p className="text-slate-500 text-xs line-clamp-2">{post.excerpt}</p>
                      {post.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {post.tags.slice(0, 4).map(t => (
                            <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {post.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(post.post_id, 'published')}
                            className="bg-green-500 hover:bg-green-600 text-white h-7 text-xs" data-testid={`approve-${post.post_id}`}>
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(post.post_id, 'rejected')}
                            className="border-red-200 text-red-500 hover:bg-red-50 h-7 text-xs" data-testid={`reject-${post.post_id}`}>
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {post.status === 'rejected' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(post.post_id, 'pending')}
                          className="h-7 text-xs">
                          <RefreshCw className="w-3 h-3 mr-1" /> Reconsider
                        </Button>
                      )}
                      <a href={post.status === 'published' ? `/blog/${post.slug}` : `/blog/preview/${post.post_id}`}
                        target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-xs w-full">
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                      </a>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(post.post_id)}
                        className="text-slate-400 hover:text-red-500 h-7 text-xs">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
