import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import API from '../utils/api';
import PostCard from '../components/PostCard';

export default function Profile() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ username: '', bio: '', avatar: '' });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        setForm({ username: user.username, bio: user.bio || '', avatar: user.avatar || '' });
        API.get(`/posts?author=${user._id}&limit=50`).then(res => setPosts(res.data.posts)).catch(console.error);
        API.get(`/posts/bookmarks/my`).then(res => setBookmarks(res.data)).catch(console.error);
    }, [user]);

    const handleSave = async () => {
        try {
            const res = await API.put('/auth/profile', form);
            login({ ...user, ...res.data });
            setEditing(false);
            setMsg('Profile updated!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { console.error(err); }
    };

    const handleBecomeAuthor = async () => {
        if (!window.confirm("Are you sure you want to become a Story Filer? This allows you to publish content on The Chronicle!")) return;
        try {
            const res = await API.put('/auth/become-author');
            login({ ...user, role: res.data.role });
            setMsg('Congratulations! You are now an Author on The Chronicle.');
            setTimeout(() => setMsg(''), 4000);
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    const isReader = user.role === 'user';

    return (
        <div className="page-wrapper">
            <div className="content-container" style={{ padding: '2rem' }}>
                <Helmet>
                    <title>My Desk — The Chronicle</title>
                    <meta name="description" content="Your personal dashboard on The Chronicle. Manage your profile, view your published stories, and file new posts." />
                </Helmet>

                {/* Header */}
                <div style={{ borderBottom: '4px solid #000', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900 }}>My Desk</h1>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
                        Personal Dashboard
                    </span>
                </div>

                {/* Profile card */}
                <div className="profile-header">
                    <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} className="profile-avatar" />
                    <div>
                        <div className="profile-name">{user.username}</div>
                        <div className="profile-role">{user.role}</div>
                        <div className="profile-bio">{user.bio || 'No bio yet'}</div>
                    </div>
                    <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setEditing(!editing)}>
                        {editing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {msg && <div className="alert alert-success">{msg}</div>}

                {editing && (
                    <div style={{ padding: '1.5rem', border: '1px solid var(--color-border)', marginBottom: '2rem', background: '#fff' }}>
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" className="form-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Avatar URL</label>
                            <input type="url" className="form-input" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea className="form-input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                        </div>
                        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                    </div>
                )}

                {isReader ? (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: '#f8f9fa', marginTop: '2rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>Want to share your own stories?</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '14px' }}>
                            Join our community of writers. Upgrade your account for free to start publishing your own articles on The Chronicle.
                        </p>
                        <button className="btn btn-primary btn-lg" onClick={handleBecomeAuthor}>
                            Become an Author
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Posts section */}
                        <div className="section-header" style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginTop: '2rem' }}>
                            <h2 style={{ fontFamily: 'var(--font-serif)' }}>My Stories ({posts.length})</h2>
                            <Link to="/create" className="btn btn-primary">
                                File New Story
                            </Link>
                        </div>

                        {posts.length > 0 ? (
                            <div className="article-grid-3col" style={{ marginTop: '1.5rem' }}>
                                {posts.map(p => <PostCard key={p._id} post={p} />)}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem', fontSize: '14px', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                                No stories filed yet. Start writing!
                            </p>
                        )}
                    </>
                )}

                {/* Bookmarks section */}
                <div className="section-header" style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginTop: '3rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)' }}>Saved Stories ({bookmarks.length})</h2>
                </div>

                {bookmarks.length > 0 ? (
                    <div className="article-grid-3col" style={{ marginTop: '1.5rem' }}>
                        {bookmarks.map(p => <PostCard key={p._id} post={p} />)}
                    </div>
                ) : (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem', fontSize: '14px', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                        No saved stories yet.
                    </p>
                )}
            </div>
        </div>
    );
}
