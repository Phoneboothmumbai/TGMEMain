import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { SEO } from '../components/SEO';
import { Search, Clock, ArrowRight, Tag, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const categoryColors = {
  'How-To Guides': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Cybersecurity & Privacy': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Troubleshooting & Tech Support': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Product Reviews & Comparisons': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Web Hosting & Domains': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Business IT Solutions': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Cloud & Business Tools': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Networking & Infrastructure': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Backup & Disaster Recovery': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Hardware & Devices': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentCategory = searchParams.get('category') || '';

  useEffect(() => {
    loadPosts();
  }, [currentPage, currentCategory, searchParams.get('q')]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 12, status: 'published' });
      if (currentCategory) params.set('category', currentCategory);
      if (searchParams.get('q')) params.set('search', searchParams.get('q'));
      const res = await fetch(`${API_URL}/api/blog/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (search) p.set('q', search); else p.delete('q');
    p.set('page', '1');
    setSearchParams(p);
  };

  const setCategory = (cat) => {
    const p = new URLSearchParams();
    if (cat) p.set('category', cat);
    p.set('page', '1');
    setSearchParams(p);
  };

  const categories = Object.keys(categoryColors);

  return (
    <div className="min-h-screen bg-slate-900">
      <SEO
        title="IT Blog — Tech Tips, Guides & Industry Insights"
        description="Read the latest IT tips, cybersecurity advice, hardware guides, and technology insights for Indian businesses. Expert articles from The Good Men Enterprise."
        keywords="IT blog Mumbai, tech tips for business, cybersecurity blog, hardware guides, IT industry insights India, TGME blog"
        path="/blog"
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-10 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            TGME <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Blog</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Expert IT insights, how-to guides, and technology best practices for Indian businesses
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-slate-800 border-slate-700 text-white placeholder-slate-500 h-10"
                placeholder="Search articles..." data-testid="blog-search" />
            </div>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white h-10">Search</Button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={() => setCategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!currentCategory ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${currentCategory === cat ? categoryColors[cat] : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No articles found yet. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map(post => (
                  <Link key={post.post_id} to={`/blog/${post.slug}`}
                    className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all group"
                    data-testid={`blog-card-${post.post_id}`}>
                    {post.featured_image && (
                      <img src={post.featured_image} alt={post.title} className="w-full h-44 object-cover" />
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryColors[post.category] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                          {post.category}
                        </span>
                        <span className="text-slate-500 text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" />{post.reading_time} min</span>
                      </div>
                      <h2 className="text-white font-semibold text-base mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-slate-400 text-sm line-clamp-3 mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                        Read More <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => (
                    <button key={i} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(i + 1)); setSearchParams(p); }}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1 ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
