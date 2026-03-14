import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Loader2, Clock, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/blog/posts/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900"><Header />
        <div className="pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900"><Header />
        <div className="pt-32 text-center"><p className="text-slate-400 text-lg">Article not found</p>
          <Link to="/blog" className="text-amber-400 hover:underline mt-4 inline-block">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const publishDate = post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  // Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.meta_description || post.excerpt,
    "author": { "@type": "Organization", "name": "The Good Men Enterprise", "url": "https://thegoodmen.in" },
    "publisher": { "@type": "Organization", "name": "The Good Men Enterprise", "logo": { "@type": "ImageObject", "url": "https://thegoodmen.in/logo.png" } },
    "datePublished": post.published_at,
    "dateModified": post.published_at,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://thegoodmen.in/blog/${post.slug}` },
    "keywords": post.meta_keywords || post.tags?.join(', '),
    "articleSection": post.category,
    "wordCount": post.word_count,
  };

  // FAQ Schema
  const faqSchema = post.faq?.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faq.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
    }))
  } : null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Helmet>
        <title>{post.title} | TGME Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta name="keywords" content={post.meta_keywords || post.tags?.join(', ')} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://thegoodmen.in/blog/${post.slug}`} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <link rel="canonical" href={`https://thegoodmen.in/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <Header />

      <article className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link to="/" className="hover:text-amber-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-amber-400">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-amber-400">{post.category}</Link>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">{post.title}</h1>
            <p className="text-slate-400 text-lg mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              {publishDate && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{publishDate}</span>}
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.reading_time} min read</span>
              <span>{post.word_count} words</span>
            </div>
          </header>

          {post.featured_image && (
            <img src={post.featured_image} alt={post.title} className="w-full rounded-xl mb-8 border border-slate-700" />
          )}

          {/* Content */}
          <div className="prose prose-invert prose-amber max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-li:text-slate-300
            prose-ul:my-4 prose-ol:my-4
            prose-code:text-amber-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-amber-500 prose-blockquote:text-slate-400"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* FAQ Section */}
          {post.faq?.length > 0 && (
            <section className="mt-12 border-t border-slate-700 pt-8">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faq.map((f, i) => (
                  <details key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl group">
                    <summary className="px-5 py-4 cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors list-none flex items-center justify-between">
                      {f.question}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed">{f.answer}</div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-8 flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-slate-500" />
              {post.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full hover:border-amber-500/30 hover:text-amber-400 transition-all">
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6 text-center">
            <h3 className="text-white font-bold text-lg mb-2">Need IT Support?</h3>
            <p className="text-slate-400 text-sm mb-4">TGME provides end-to-end IT solutions for businesses across India.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/support" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">Get Support</Link>
              <Link to="/amc" className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">View AMC Plans</Link>
            </div>
          </div>

          {/* Back to blog */}
          <div className="mt-8 text-center">
            <Link to="/blog" className="text-amber-400 hover:underline text-sm flex items-center gap-1 justify-center">
              <ChevronLeft className="w-4 h-4" /> Back to All Articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
