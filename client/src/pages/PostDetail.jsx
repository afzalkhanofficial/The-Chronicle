import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import API from '../utils/api';
import socket from '../utils/socket';
import { useAuth } from '../context/AuthContext';

// Helper component for Material Symbols icons (loaded via Google Fonts)
const Icon = ({ name, style }) => <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', ...style }}>{name}</span>;

export default function PostDetail() {
    const { slug } = useParams();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [upvoted, setUpvoted] = useState(false);
    const [downvoted, setDownvoted] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const renderRoleBadge = (role) => {
        if (role === 'admin') return <span title="Admin" className="material-symbols-outlined" style={{ fontSize: '16px', color: '#eab308', marginLeft: '4px' }}>shield</span>;
        if (role === 'author') return <span title="Author" className="material-symbols-outlined" style={{ fontSize: '16px', color: '#06b6d4', marginLeft: '4px' }}>history_edu</span>;
        return null;
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await API.get(`/posts/${slug}`);
                setPost(res.data);
                if (user) {
                    setUpvoted(res.data.upvotes?.includes(user._id));
                    setDownvoted(res.data.downvotes?.includes(user._id));

                    // Fetch user bookmarks to see if saved
                    API.get('/auth/me').then(me => {
                        if (me.data.bookmarks?.includes(res.data._id)) setBookmarked(true);
                    }).catch(console.error);
                }
                const commRes = await API.get(`/comments/${res.data._id}`);
                setComments(commRes.data);

                // Join real-time room for this post
                socket.emit('joinPost', res.data._id);
            } catch (err) { console.error(err); navigate('/posts'); }
            setLoading(false);
        };
        fetchPost();

        // Cleanup: leave room when leaving page
        return () => {
            if (post?._id) {
                socket.emit('leavePost', post._id);
            }
        };
    }, [slug]);

    // Real-time: listen for new comments from other users
    useEffect(() => {
        const handleNewComment = (data) => {
            // Only add if the comment was not from us (we already add it locally)
            if (data.parentId) {
                setComments(prev => prev.map(c =>
                    c._id === data.parentId
                        ? { ...c, replies: [...(c.replies || []), data.comment] }
                        : c
                ));
            } else {
                setComments(prev => {
                    // Check if already exists (from our own submission)
                    if (prev.some(c => c._id === data.comment._id)) return prev;
                    return [{ ...data.comment, replies: [] }, ...prev];
                });
            }
        };

        const handleDeleteComment = (data) => {
            if (data.parentId) {
                setComments(prev => prev.map(c =>
                    c._id === data.parentId
                        ? { ...c, replies: (c.replies || []).filter(r => r._id !== data.commentId) }
                        : c
                ));
            } else {
                setComments(prev => prev.filter(c => c._id !== data.commentId));
            }
        };

        socket.on('newComment', handleNewComment);
        socket.on('deleteComment', handleDeleteComment);

        return () => {
            socket.off('newComment', handleNewComment);
            socket.off('deleteComment', handleDeleteComment);
        };
    }, []);

    const handleUpvote = async () => {
        if (!user) return navigate('/login');
        try {
            const res = await API.put(`/posts/${post._id}/upvote`);
            setPost(prev => ({ ...prev, upvotes: res.data.upvotes, downvotes: res.data.downvotes }));
            setUpvoted(res.data.upvotes.includes(user._id));
            setDownvoted(res.data.downvotes.includes(user._id));
        } catch (err) { console.error(err); }
    };

    const handleDownvote = async () => {
        if (!user) return navigate('/login');
        try {
            const res = await API.put(`/posts/${post._id}/downvote`);
            setPost(prev => ({ ...prev, upvotes: res.data.upvotes, downvotes: res.data.downvotes }));
            setUpvoted(res.data.upvotes.includes(user._id));
            setDownvoted(res.data.downvotes.includes(user._id));
        } catch (err) { console.error(err); }
    };

    const handleBookmark = async () => {
        if (!user) return navigate('/login');
        try {
            const res = await API.put(`/posts/${post._id}/bookmark`);
            setBookmarked(res.data.includes(post._id));
        } catch (err) { console.error(err); }
    };

    const handleCommentUpvote = async (commentId, parentId) => {
        if (!user) return navigate('/login');
        try {
            const res = await API.put(`/comments/${commentId}/upvote`);
            setComments(prev => prev.map(c => {
                if (parentId) {
                    if (c._id === parentId) {
                        return { ...c, replies: c.replies.map(r => r._id === commentId ? { ...r, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : r) };
                    }
                    return c;
                }
                return c._id === commentId ? { ...c, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : c;
            }));
        } catch (err) { console.error(err); }
    };

    const handleCommentDownvote = async (commentId, parentId) => {
        if (!user) return navigate('/login');
        try {
            const res = await API.put(`/comments/${commentId}/downvote`);
            setComments(prev => prev.map(c => {
                if (parentId) {
                    if (c._id === parentId) {
                        return { ...c, replies: c.replies.map(r => r._id === commentId ? { ...r, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : r) };
                    }
                    return c;
                }
                return c._id === commentId ? { ...c, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : c;
            }));
        } catch (err) { console.error(err); }
    };

    const handleToggleEditorsPick = async () => {
        if (!isAdmin) return;
        try {
            const res = await API.put(`/posts/${post._id}/editors-pick`);
            setPost(prev => ({ ...prev, featured: res.data.featured }));
        } catch (err) { console.error(err); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const res = await API.post(`/comments/${post._id}`, { content: commentText });
            setComments(prev => [{ ...res.data, replies: [] }, ...prev]);
            setCommentText('');
            setPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
        } catch (err) { console.error(err); }
    };

    const handleReply = async (parentId) => {
        if (!replyText.trim()) return;
        try {
            const res = await API.post(`/comments/${post._id}`, { content: replyText, parentComment: parentId });
            setComments(prev => prev.map(c => c._id === parentId ? { ...c, replies: [...(c.replies || []), res.data] } : c));
            setReplyTo(null);
            setReplyText('');
        } catch (err) { console.error(err); }
    };

    const handleDeleteComment = async (id, parentId) => {
        try {
            await API.delete(`/comments/${id}`);
            if (parentId) {
                setComments(prev => prev.map(c => c._id === parentId ? { ...c, replies: c.replies.filter(r => r._id !== id) } : c));
            } else {
                setComments(prev => prev.filter(c => c._id !== id));
            }
        } catch (err) { console.error(err); }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Delete this post?')) return;
        try { await API.delete(`/posts/${post._id}`); navigate('/posts'); } catch (err) { console.error(err); }
    };

    const shareUrl = window.location.href;

    if (loading) return <div className="page-wrapper"><div className="loader"><div className="spinner"></div></div></div>;
    if (!post) return null;

    const date = new Date(post.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const readingTime = Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 200));
    const canEdit = user && (user._id === post.author?._id || isAdmin);
    const postScore = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

    return (
        <div className="page-wrapper">
            <Helmet>
                <title>{post.title} — The Chronicle</title>
                <meta name="description" content={post.excerpt || post.content?.substring(0, 160)} />
            </Helmet>

            <div className="content-container" style={{ padding: '2rem' }}>
                <div className="post-detail">
                    {/* Header */}
                    <div className="post-header">
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            {post.category && (
                                <span className="category-label" style={{ display: 'inline-block' }}>{post.category.name}</span>
                            )}
                            {post.featured && (
                                <span className="category-label" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', display: 'inline-block' }}>★ Editor's Pick</span>
                            )}
                        </div>
                        <h1>{post.title}</h1>
                    </div>

                    {/* Cover image */}
                    <img src={post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'} alt={post.title} className="post-cover" />

                    {/* Author bar */}
                    <div className="post-author-bar">
                        <img src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`} alt={post.author?.username} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                        <div className="author-info">
                            <div className="author-name" style={{ display: 'flex', alignItems: 'center' }}>
                                By {post.author?.username} {post.author?.role && renderRoleBadge(post.author.role)}
                            </div>
                            <div className="post-date">{date} · {readingTime} min read · <Icon name="visibility" /> {post.views} views</div>
                        </div>
                        <div className="post-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div className="vote-container">
                                <button className={`vote-btn ${upvoted ? 'upvoted' : ''}`} onClick={handleUpvote} title="Upvote">
                                    <Icon name="arrow_upward" />
                                </button>
                                <span className="vote-score">{postScore}</span>
                                <button className={`vote-btn ${downvoted ? 'downvoted' : ''}`} onClick={handleDownvote} title="Downvote">
                                    <Icon name="arrow_downward" />
                                </button>
                            </div>
                            <button className={`btn-ghost ${bookmarked ? 'active' : ''}`} onClick={handleBookmark} style={{ border: '1px solid var(--color-border)', borderRadius: '50%', padding: '0.4rem', color: bookmarked ? 'var(--color-accent)' : 'inherit' }} title={bookmarked ? "Remove Bookmark" : "Save Story"}>
                                <Icon name={bookmarked ? "bookmark_added" : "bookmark_add"} />
                            </button>

                            {isAdmin && (
                                <button className="btn btn-secondary btn-sm" onClick={handleToggleEditorsPick} title={post.featured ? "Remove from Editor's Pick" : "Make Editor's Pick"}>
                                    <Icon name="star" style={{ color: post.featured ? '#eab308' : 'inherit' }} />
                                </button>
                            )}

                            {canEdit && (
                                <>
                                    <Link to={`/edit/${post._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }} title="Edit Story"><Icon name="edit" /></Link>
                                    <button className="btn btn-danger btn-sm" style={{ padding: '0.4rem' }} onClick={handleDeletePost} title="Delete Story"><Icon name="delete" /></button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="post-content">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                        <div className="post-tags">
                            {post.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
                        </div>
                    )}

                    {/* Share */}
                    <div className="share-section">
                        <span>Share:</span>
                        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`} target="_blank" rel="noreferrer" className="share-btn">𝕏</a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="share-btn">f</a>
                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noreferrer" className="share-btn">in</a>
                    </div>

                    {/* Comments */}
                    <div className="comments-section">
                        <h3><Icon name="chat_bubble" /> Correspondence ({post.commentsCount || 0})</h3>

                        {user ? (
                            <form className="comment-form" onSubmit={handleComment}>
                                <textarea className="form-input" placeholder="Join the conversation..." value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={3} />
                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                            </form>
                        ) : (
                            <p style={{ marginBottom: '1.5rem', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>Sign in</Link> to leave a comment.
                            </p>
                        )}

                        {comments.map(comment => (
                            <div key={comment._id} className="comment" style={{ paddingBottom: '1rem', borderBottom: '1px solid #f1f1f1', marginBottom: '1rem' }}>
                                <div className="comment-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <img src={comment.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username}`} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                    <span className="comment-author" style={{ fontWeight: 700, fontSize: '13px' }}>{comment.user?.username}</span>
                                    {comment.user?.role && renderRoleBadge(comment.user.role)}
                                    <span className="comment-date" style={{ color: '#888', fontSize: '12px' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="comment-body" style={{ marginLeft: '32px', marginBottom: '0.5rem', fontSize: '14px' }}>{comment.content}</div>
                                <div className="comment-actions" style={{ marginLeft: '32px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div className="vote-container" style={{ borderRadius: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                        <button className={`vote-btn ${comment.upvotes?.includes(user?._id) ? 'upvoted' : ''}`} style={{ padding: '0.1rem 0.3rem' }} onClick={() => handleCommentUpvote(comment._id)}><Icon name="arrow_upward" style={{ fontSize: '14px' }} /></button>
                                        <span className="vote-score" style={{ padding: '0 0.3rem', minWidth: '20px', fontSize: '12px' }}>{(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}</span>
                                        <button className={`vote-btn ${comment.downvotes?.includes(user?._id) ? 'downvoted' : ''}`} style={{ padding: '0.1rem 0.3rem' }} onClick={() => handleCommentDownvote(comment._id)}><Icon name="arrow_downward" style={{ fontSize: '14px' }} /></button>
                                    </div>
                                    {user && <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}>Reply</button>}
                                    {(user?._id === comment.user?._id || isAdmin) && <button className="btn-ghost" style={{ fontSize: '12px', color: '#ef4444' }} onClick={() => handleDeleteComment(comment._id)}>Delete</button>}
                                </div>

                                {replyTo === comment._id && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <textarea className="form-input" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} style={{ fontSize: '0.85rem' }} />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleReply(comment._id)}>Reply</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setReplyTo(null)}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {comment.replies?.length > 0 && (
                                    <div className="replies">
                                        {comment.replies.map(reply => (
                                            <div key={reply._id} className="comment" style={{ padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid var(--color-border)' }}>
                                                <div className="comment-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <img src={reply.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user?.username}`} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                                                    <span className="comment-author" style={{ fontWeight: 700, fontSize: '12px' }}>{reply.user?.username}</span>
                                                    {reply.user?.role && renderRoleBadge(reply.user.role)}
                                                    <span className="comment-date" style={{ color: '#888', fontSize: '11px' }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="comment-body" style={{ marginLeft: '28px', marginBottom: '0.5rem', fontSize: '13px' }}>{reply.content}</div>
                                                <div className="comment-actions" style={{ marginLeft: '28px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <div className="vote-container" style={{ borderRadius: '4px', background: 'var(--color-paper)', border: '1px solid var(--color-border)' }}>
                                                        <button className={`vote-btn ${reply.upvotes?.includes(user?._id) ? 'upvoted' : ''}`} style={{ padding: '0.1rem 0.3rem' }} onClick={() => handleCommentUpvote(reply._id, comment._id)}><Icon name="arrow_upward" style={{ fontSize: '12px' }} /></button>
                                                        <span className="vote-score" style={{ padding: '0 0.3rem', minWidth: '20px', fontSize: '11px' }}>{(reply.upvotes?.length || 0) - (reply.downvotes?.length || 0)}</span>
                                                        <button className={`vote-btn ${reply.downvotes?.includes(user?._id) ? 'downvoted' : ''}`} style={{ padding: '0.1rem 0.3rem' }} onClick={() => handleCommentDownvote(reply._id, comment._id)}><Icon name="arrow_downward" style={{ fontSize: '12px' }} /></button>
                                                    </div>
                                                    {(user?._id === reply.user?._id || isAdmin) && <button className="btn-ghost" style={{ fontSize: '11px', color: '#ef4444' }} onClick={() => handleDeleteComment(reply._id, comment._id)}>Delete</button>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
