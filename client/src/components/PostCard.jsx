import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
    const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const readingTime = Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 200));

    const renderRoleBadge = (role) => {
        if (role === 'admin') return <span title="Admin" className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#eab308', marginLeft: '4px' }}>shield</span>;
        if (role === 'author') return <span title="Author" className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', color: '#06b6d4', marginLeft: '4px' }}>history_edu</span>;
        return null;
    };

    return (
        <Link to={`/posts/${post.slug}`} className="article-card">
            <img
                src={post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=300&fit=crop'}
                alt={post.title}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '0.5rem' }}>
                {post.category && (
                    <span className="category-label">{post.category.name}</span>
                )}
                {post.featured && (
                    <span className="category-label" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>★ Editor's Pick</span>
                )}
            </div>
            <h3>{post.title}</h3>
            <p className="article-excerpt">{post.excerpt}</p>
            <div className="article-meta-line">
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    By {post.author?.username || 'Staff'} {post.author?.role && renderRoleBadge(post.author.role)}
                </span>
                <span>{date} · {readingTime} min read</span>
            </div>
        </Link>
    );
}
