import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Loader2, Clock, Calendar, Tag, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
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
        <div className="pt-32 text-center"><p className="text-slate-300 text-lg">Article not found</p>
          <Link to="/blog" className="text-amber-400 hover:underline mt-4 inline-block">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const publishDate = post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

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
    <div className="min-h-screen bg-slate-950">
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

      {/* Blog post styles for inline CTAs */}
      <style>{`
        .blog-content h2 {
          color: #ffffff;
          font-size: 1.625rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          line-height: 1.3;
        }
        .blog-content h3 {
          color: #f1f5f9;
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .blog-content p {
          color: #e2e8f0;
          font-size: 1.0625rem;
          line-height: 1.85;
          margin-bottom: 1.25rem;
        }
        .blog-content strong {
          color: #ffffff;
          font-weight: 600;
        }
        .blog-content a {
          color: #fbbf24;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .blog-content a:hover {
          color: #f59e0b;
          text-decoration: underline;
        }
        .blog-content ul, .blog-content ol {
          color: #e2e8f0;
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }
        .blog-content li {
          color: #e2e8f0;
          line-height: 1.8;
          margin-bottom: 0.5rem;
          font-size: 1.0625rem;
        }
        .blog-content blockquote {
          border-left: 3px solid #f59e0b;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
          background: rgba(245, 158, 11, 0.05);
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .blog-content blockquote p {
          color: #cbd5e1;
          font-style: italic;
        }
        .blog-content code {
          color: #fcd34d;
          background: rgba(30, 41, 59, 0.8);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.9375rem;
        }
        .blog-content .blog-cta {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.06) 100%);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 0.75rem;
          padding: 1.25rem 1.5rem;
          margin: 2rem 0;
        }
        .blog-content .blog-cta p {
          color: #f1f5f9;
          margin: 0;
          font-size: 1rem;
          line-height: 1.7;
        }
        .blog-content .blog-cta a {
          color: #fbbf24;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .blog-content .blog-cta a:hover {
          color: #fde68a;
        }
      `}</style>

      <article className="pt-28 pb-20 px-5 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8" data-testid="breadcrumb">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-amber-400 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-amber-400 transition-colors">{post.category}</Link>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-5">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-5">{post.title}</h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-5">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              {publishDate && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{publishDate}</span>}
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.reading_time} min read</span>
              <span>{post.word_count} words</span>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <img src={post.featured_image} alt={post.title}
              className="w-full rounded-xl mb-10 border border-slate-700/50" data-testid="featured-image" />
          )}

          {/* Key Takeaways */}
          {post.key_takeaways?.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 mb-10" data-testid="key-takeaways">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                Key Takeaways
              </h2>
              <ul className="space-y-3">
                {post.key_takeaways.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200 text-[15px] leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mid-article CTA - shown before content if no key takeaways */}
          {!post.key_takeaways?.length && (
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-5 mb-10 flex items-center justify-between flex-wrap gap-3">
              <p className="text-slate-200 text-sm"><strong className="text-white">Need help with this topic?</strong> TGME offers expert IT solutions.</p>
              <Link to="/support" className="text-amber-400 text-sm font-semibold hover:text-amber-300 flex items-center gap-1 flex-shrink-0">
                Get Support <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Article Content */}
          <div className="blog-content" data-testid="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* FAQ Section */}
          {post.faq?.length > 0 && (
            <section className="mt-14 border-t border-slate-700/50 pt-10" data-testid="faq-section">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {post.faq.map((f, i) => (
                  <details key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl group">
                    <summary className="px-5 py-4 cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors list-none flex items-center justify-between">
                      {f.question}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="px-5 pb-4 text-slate-300 text-sm leading-relaxed">{f.answer}</div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-10 flex items-center gap-2 flex-wrap" data-testid="tags-section">
              <Tag className="w-4 h-4 text-slate-500" />
              {post.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-full hover:border-amber-500/30 hover:text-amber-400 transition-all">
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-14 bg-gradient-to-br from-amber-500/15 to-amber-700/5 border border-amber-500/25 rounded-2xl p-8 text-center" data-testid="bottom-cta">
            <h3 className="text-white font-bold text-xl mb-3">Need IT Support for Your Business?</h3>
            <p className="text-slate-300 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              TGME provides end-to-end IT solutions — from AMC plans and cybersecurity to hardware repair and cloud setup. Serving businesses across India.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/support" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors inline-flex items-center gap-2" data-testid="cta-support">
                Get Expert Support <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/amc" className="bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors border border-white/10" data-testid="cta-amc">
                View AMC Plans
              </Link>
            </div>
          </div>

          {/* Back to blog */}
          <div className="mt-10 text-center">
            <Link to="/blog" className="text-amber-400 hover:underline text-sm flex items-center gap-1 justify-center" data-testid="back-to-blog">
              <ChevronLeft className="w-4 h-4" /> Back to All Articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
