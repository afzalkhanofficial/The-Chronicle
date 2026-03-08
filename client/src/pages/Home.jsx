import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import API from '../utils/api';
import PostCard from '../components/PostCard';

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [recent, setRecent] = useState([]);
    const [categories, setCategories] = useState([]);
    const [trending, setTrending] = useState([]);
    const [topAuthors, setTopAuthors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featuredRes, recentRes, catRes, trendingRes] = await Promise.all([
                    API.get('/posts?featured=true&limit=1'),
                    API.get('/posts?limit=6'),
                    API.get('/categories'),
                    API.get('/posts?sort=popular&limit=4')
                ]);
                setFeatured(featuredRes.data.posts);
                setRecent(recentRes.data.posts);
                setCategories(catRes.data);
                setTrending(trendingRes.data.posts);

                // Build Author Highlights from the posts data
                const authorMap = {};
                recentRes.data.posts.forEach(post => {
                    if (post.author && !authorMap[post.author._id]) {
                        authorMap[post.author._id] = {
                            _id: post.author._id,
                            username: post.author.username,
                            avatar: post.author.avatar,
                            role: post.author.role,
                            postCount: 1
                        };
                    } else if (post.author && authorMap[post.author._id]) {
                        authorMap[post.author._id].postCount += 1;
                    }
                });
                setTopAuthors(Object.values(authorMap).slice(0, 4));
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="page-wrapper"><div className="loader"><div className="spinner"></div></div></div>;

    const coverPost = featured[0] || recent[0];
    const coverReadingTime = coverPost ? Math.max(1, Math.ceil((coverPost.content?.split(/\s+/).length || 0) / 200)) : 1;
    const sidebarPosts = recent.slice(0, 4);
    const gridPosts = recent.slice(0, 4);

    const renderRoleBadge = (role) => {
        if (role === 'admin') return <span title="Admin" className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#eab308', marginLeft: '4px' }}>shield</span>;
        if (role === 'author') return <span title="Author" className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#06b6d4', marginLeft: '4px' }}>history_edu</span>;
        return null;
    };

    return (
        <div className="page-wrapper">
            <Helmet>
                <title>The Chronicle — Your Digital Broadsheet</title>
                <meta name="description" content="The Chronicle is your premier digital broadsheet for insightful blog content, long-form journalism, and community-driven storytelling." />
            </Helmet>

            <main className="main-content">
                <div className="newspaper-grid">

                    {/* LEFT SIDEBAR */}
                    <aside className="left-sidebar vertical-divider">
                        {/* Categories */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 className="sidebar-section-title">Sections</h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {categories.map(cat => (
                                    <li key={cat._id}>
                                        <Link to={`/posts?category=${cat._id}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', transition: 'color 0.2s' }}>
                                            <span>{cat.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Author Highlights */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 className="sidebar-section-title">Author Highlights</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {topAuthors.map(author => (
                                    <div key={author._id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <img
                                            src={author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username}`}
                                            alt={author.username}
                                            style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--color-border)' }}
                                        />
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>
                                                {author.username} {renderRoleBadge(author.role)}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{author.postCount} {author.postCount === 1 ? 'Story' : 'Stories'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Editor's Dispatch */}
                        <div style={{ background: 'var(--color-bg)', padding: '1rem', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                            <h4 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', marginBottom: '0.5rem' }}>The Editor's Dispatch</h4>
                            <p style={{ fontSize: '11px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                                "Welcome to The Chronicle. We believe in the power of written expression. Every post here is a contribution to the digital commons."
                            </p>
                            <p style={{ fontSize: '10px', fontWeight: 700, marginTop: '0.5rem', textTransform: 'uppercase' }}>— The Editorial Board</p>
                        </div>

                        {/* Trending */}
                        <div>
                            <h4 className="sidebar-section-title">Trending</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {trending.map((post, i) => (
                                    <Link key={post._id} to={`/posts/${post.slug}`} style={{ display: 'block' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <h5 style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>{post.title}</h5>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER CONTENT */}
                    <div className="center-content vertical-divider" style={{ gridColumn: 'span 1' }}>

                        {/* Cover Story */}
                        {coverPost && (
                            <article className="cover-story">
                                <div className="cover-story-header">
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '0.5rem', justifyContent: 'center' }}>
                                        <span className="cover-label">Cover Story</span>
                                        {coverPost.featured && (
                                            <span className="category-label" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>★ Editor's Pick</span>
                                        )}
                                    </div>
                                    <Link to={`/posts/${coverPost.slug}`}>
                                        <h2 className="cover-title">{coverPost.title}</h2>
                                    </Link>
                                    <p className="cover-subtitle">{coverPost.excerpt}</p>
                                </div>

                                <Link to={`/posts/${coverPost.slug}`}>
                                    <img
                                        className="cover-image"
                                        src={coverPost.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'}
                                        alt={coverPost.title}
                                    />
                                </Link>

                                <div className="cover-meta" style={{ marginTop: '1rem' }}>
                                    <span className="author-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        By {coverPost.author?.username || 'Staff'} {coverPost.author?.role && renderRoleBadge(coverPost.author.role)}
                                    </span>
                                    <span className="read-time">{coverReadingTime} min read · {coverPost.views || 0} Views</span>
                                </div>
                            </article>
                        )}

                        {/* Article Grid */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 className="sidebar-section-title">Latest Stories</h4>
                            <div className="article-grid-2col">
                                {gridPosts.map(post => (
                                    <PostCard key={post._id} post={post} />
                                ))}
                            </div>
                        </div>

                        {/* View all link */}
                        <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                            <Link to="/posts" className="btn btn-primary btn-lg">View All Stories →</Link>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <aside className="right-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Must Read */}
                        <div>
                            <h4 className="sidebar-section-title">Must Read</h4>
                            {sidebarPosts.map(post => (
                                <Link key={post._id} to={`/posts/${post.slug}`} className="must-read-article">
                                    <div className="thumb">
                                        <img src={post.coverImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.title}`} alt="" />
                                    </div>
                                    <div>
                                        <h5>{post.title}</h5>
                                        <p className="byline" style={{ display: 'flex', alignItems: 'center' }}>
                                            By {post.author?.username || 'Staff'} {post.author?.role && renderRoleBadge(post.author.role)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Newsletter */}
                        <div className="newsletter-box">
                            <span className="newsletter-label">Weekly Newsletter</span>
                            <h3>Deep Insights for the Modern Mind.</h3>
                            <p>Join our community of readers. Get the best stories delivered to your inbox every week.</p>
                            <input type="email" placeholder="Email address" />
                            <button className="btn-newsletter">Join the List</button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
