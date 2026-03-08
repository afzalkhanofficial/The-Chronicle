import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function CreateEditPost() {
    const { id } = useParams();
    const isEdit = !!id;
    const { user, isAuthor } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [preview, setPreview] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', coverImage: '', category: '', tags: [], status: 'published' });

    useEffect(() => {
        if (!user || !isAuthor) { navigate('/login'); return; }
        API.get('/categories').then(res => setCategories(res.data)).catch(console.error);
        if (isEdit) {
            setLoading(true);
            API.get('/posts?limit=100').then(res => {
                const post = res.data.posts.find(p => p._id === id);
                if (post) {
                    setForm({ title: post.title, content: post.content, excerpt: post.excerpt || '', coverImage: post.coverImage || '', category: post.category?._id || '', tags: post.tags || [], status: post.status });
                }
                setLoading(false);
            }).catch(err => { console.error(err); setLoading(false); });
        }
    }, [id, user]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!form.tags.includes(tagInput.trim())) {
                setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tag) => setForm({ ...form, tags: form.tags.filter(t => t !== tag) });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim() || !form.content.trim()) return setError('Title and content are required');
        setLoading(true);
        try {
            if (isEdit) { await API.put(`/posts/${id}`, form); }
            else { await API.post('/posts', form); }
            navigate('/posts');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save post');
        }
        setLoading(false);
    };

    if (loading && isEdit) return <div className="page-wrapper"><div className="loader"><div className="spinner"></div></div></div>;

    return (
        <div className="page-wrapper">
            <div className="content-container" style={{ padding: '2rem' }}>
                <div className="editor-page">
                    <Helmet>
                        <title>{isEdit ? 'Edit Story' : 'File a New Story'} — The Chronicle</title>
                        <meta name="description" content="Create or edit a blog post on The Chronicle. Write your story using Markdown, add tags, and publish or save as draft." />
                    </Helmet>

                    <h2>{isEdit ? 'Edit Story' : 'File a New Story'}</h2>
                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Mode toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <button className={`btn ${!preview ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setPreview(false)}>Write</button>
                        <button className={`btn ${preview ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setPreview(true)}>Preview</button>
                    </div>

                    {preview ? (
                        <div style={{ padding: '2rem', border: '1px solid var(--color-border)', background: '#fff' }}>
                            <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem', fontSize: '2rem' }}>{form.title || 'Untitled'}</h1>
                            <div className="post-content"><ReactMarkdown>{form.content || '*No content yet*'}</ReactMarkdown></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Headline</label>
                                <input type="text" name="title" className="form-input" placeholder="Your story headline" value={form.title} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Cover Image URL</label>
                                <input type="url" name="coverImage" className="form-input" placeholder="https://example.com/image.jpg" value={form.coverImage} onChange={handleChange} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Section</label>
                                    <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                                        <option value="">Select section</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tags (press Enter to add)</label>
                                <div className="tags-input">
                                    {form.tags.map(tag => (
                                        <span key={tag} className="tag">{tag} <button type="button" onClick={() => removeTag(tag)}>&times;</button></span>
                                    ))}
                                    <input type="text" placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Lede / Excerpt</label>
                                <textarea name="excerpt" className="form-input" placeholder="Brief description (auto-generated if empty)" value={form.excerpt} onChange={handleChange} rows={3} />
                            </div>
                            <div className="form-group">
                                <label>Body (Markdown supported)</label>
                                <textarea name="content" className="form-input content-editor" placeholder="Write your story here using Markdown..." value={form.content} onChange={handleChange} required />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Filing...' : isEdit ? 'Update Story' : 'Publish Story'}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
