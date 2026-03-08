import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import API from '../utils/api';

// Helper component for Material Symbols icons
const Icon = ({ name, style }) => <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', ...style }}>{name}</span>;
export default function Admin() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState({ name: '', description: '', color: '#c2410c' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !isAdmin) { navigate('/'); return; }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [postsRes, usersRes, catsRes] = await Promise.all([
                API.get('/posts?limit=100&status=all'),
                API.get('/auth/users'),
                API.get('/categories')
            ]);
            setPosts(postsRes.data.posts);
            setUsers(usersRes.data);
            setCategories(catsRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('Delete this post?')) return;
        try { await API.delete(`/posts/${id}`); setPosts(prev => prev.filter(p => p._id !== id)); } catch (err) { console.error(err); }
    };

    const handleApprovePost = async (id) => {
        try {
            const res = await API.put(`/posts/${id}/approve`);
            setPosts(prev => prev.map(p => p._id === id ? res.data : p));
        } catch (err) { console.error(err); }
    };

    const handleRejectPost = async (id) => {
        try {
            const res = await API.put(`/posts/${id}/reject`);
            setPosts(prev => prev.map(p => p._id === id ? res.data : p));
        } catch (err) { console.error(err); }
    };

    const handleRoleChange = async (id, role) => {
        try { await API.put(`/auth/users/${id}/role`, { role }); setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u)); } catch (err) { console.error(err); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try { await API.delete(`/auth/users/${id}`); setUsers(prev => prev.filter(u => u._id !== id)); } catch (err) { console.error(err); }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCat.name.trim()) return;
        try {
            const res = await API.post('/categories', newCat);
            setCategories(prev => [...prev, res.data]);
            setNewCat({ name: '', description: '', color: '#c2410c' });
        } catch (err) { console.error(err); }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete category?')) return;
        try { await API.delete(`/categories/${id}`); setCategories(prev => prev.filter(c => c._id !== id)); } catch (err) { console.error(err); }
    };

    if (loading) return <div className="page-wrapper"><div className="loader"><div className="spinner"></div></div></div>;

    const pendingPosts = posts.filter(p => p.status === 'pending');
    const pendingCount = pendingPosts.length;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published': return 'badge-success';
            case 'pending': return 'badge-primary';
            case 'rejected': return 'badge-danger';
            default: return 'badge-primary';
        }
    };

    return (
        <div className="page-wrapper">
            <Helmet>
                <title>Newsroom — The Chronicle Admin</title>
                <meta name="description" content="Admin control panel for The Chronicle. Manage posts, users, categories, and moderate pending content." />
            </Helmet>

            <div className="content-container" style={{ padding: '2rem' }}>

                {/* Header */}
                <div style={{ borderBottom: '4px solid #000', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900 }}>Newsroom</h1>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
                        Admin Control Panel
                    </span>
                </div>

                <div className="admin-layout">
                    {/* Sidebar */}
                    <div className="admin-sidebar">
                        <h3>Control Desk</h3>
                        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}><Icon name="dashboard" /> Dashboard</button>
                        <button className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>
                            <Icon name="check" /> Pending {pendingCount > 0 && <span className="badge badge-danger" style={{ marginLeft: '0.3rem' }}>{pendingCount}</span>}
                        </button>
                        <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}><Icon name="article" /> Stories</button>
                        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><Icon name="group" /> Staff</button>
                        <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}><Icon name="label" /> Sections</button>
                    </div>

                    {/* Content */}
                    <div className="admin-content">

                        {/* DASHBOARD TAB */}
                        {tab === 'dashboard' && (
                            <>
                                <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Dashboard</h2>
                                <div className="admin-stats">
                                    <div className="stat-card"><div className="stat-value">{posts.length}</div><div className="stat-label">Stories</div></div>
                                    <div className="stat-card"><div className="stat-value">{users.length}</div><div className="stat-label">Staff</div></div>
                                    <div className="stat-card"><div className="stat-value">{categories.length}</div><div className="stat-label">Sections</div></div>
                                    <div className="stat-card">
                                        <div className="stat-value" style={{ color: pendingCount > 0 ? 'var(--color-accent)' : undefined }}>{pendingCount}</div>
                                        <div className="stat-label">Pending</div>
                                    </div>
                                </div>
                                <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>Recent Stories</h3>
                                <table className="data-table">
                                    <thead><tr><th>Headline</th><th>Author</th><th>Status</th><th>Reads</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {posts.slice(0, 5).map(p => (
                                            <tr key={p._id}>
                                                <td><Link to={`/posts/${p.slug}`} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{p.title}</Link></td>
                                                <td>{p.author?.username}</td>
                                                <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                                                <td>{p.views}</td>
                                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* PENDING / MODERATION TAB */}
                        {tab === 'pending' && (
                            <>
                                <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Content Moderation</h2>
                                {pendingPosts.length === 0 ? (
                                    <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontFamily: 'var(--font-serif)', textAlign: 'center', padding: '3rem' }}>
                                        No pending posts to review.
                                    </p>
                                ) : (
                                    <table className="data-table">
                                        <thead><tr><th>Headline</th><th>Author</th><th>Submitted</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {pendingPosts.map(p => (
                                                <tr key={p._id}>
                                                    <td style={{ maxWidth: 300 }}>{p.title}</td>
                                                    <td>{p.author?.username}</td>
                                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                                    <td style={{ display: 'flex', gap: '0.3rem' }}>
                                                        <button className="btn btn-primary btn-sm" onClick={() => handleApprovePost(p._id)} title="Approve">
                                                            <Icon name="check" /> Approve
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleRejectPost(p._id)} title="Reject">
                                                            <Icon name="close" /> Reject
                                                        </button>
                                                        <Link to={`/posts/${p.slug}`} className="btn btn-secondary btn-sm">View</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {/* POSTS TAB */}
                        {tab === 'posts' && (
                            <>
                                <div className="section-header"><h2 style={{ fontFamily: 'var(--font-serif)' }}>Manage Stories</h2><Link to="/create" className="btn btn-primary">+ New Story</Link></div>
                                <table className="data-table">
                                    <thead><tr><th>Headline</th><th>Author</th><th>Section</th><th>Status</th><th>Reads</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {posts.map(p => (
                                            <tr key={p._id}>
                                                <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                                                <td>{p.author?.username}</td>
                                                <td>{p.category?.name || '—'}</td>
                                                <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                                                <td>{p.views}</td>
                                                <td style={{ display: 'flex', gap: '0.3rem' }}>
                                                    {p.status === 'pending' && (
                                                        <>
                                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-success)' }} onClick={() => handleApprovePost(p._id)} title="Approve"><Icon name="check" /></button>
                                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleRejectPost(p._id)} title="Reject"><Icon name="close" /></button>
                                                        </>
                                                    )}
                                                    <Link to={`/edit/${p._id}`} className="btn btn-ghost btn-sm"><Icon name="edit" /></Link>
                                                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeletePost(p._id)}><Icon name="delete" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* USERS TAB */}
                        {tab === 'users' && (
                            <>
                                <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Manage Staff</h2>
                                <table className="data-table">
                                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id}>
                                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                                    {u.username}
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <select className="form-input" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                                                        <option value="user">User</option>
                                                        <option value="author">Author</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td>{u._id !== user._id && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteUser(u._id)}><Icon name="delete" /></button>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* CATEGORIES TAB */}
                        {tab === 'categories' && (
                            <>
                                <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Manage Sections</h2>
                                <form onSubmit={handleCreateCategory} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', marginBottom: '1.5rem', background: 'var(--color-paper)' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Add New Section</h3>
                                    <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Name</label>
                                            <input type="text" className="form-input" placeholder="Section name" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Color</label>
                                            <input type="color" className="form-input" style={{ height: 38, padding: '0.2rem' }} value={newCat.color} onChange={(e) => setNewCat({ ...newCat, color: e.target.value })} />
                                        </div>
                                        <button type="submit" className="btn btn-primary">Add</button>
                                    </div>
                                </form>
                                <table className="data-table">
                                    <thead><tr><th>Color</th><th>Name</th><th>Slug</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {categories.map(c => (
                                            <tr key={c._id}>
                                                <td><div style={{ width: 16, height: 16, background: c.color }} /></td>
                                                <td>{c.name}</td>
                                                <td>{c.slug}</td>
                                                <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteCategory(c._id)}><Icon name="delete" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
