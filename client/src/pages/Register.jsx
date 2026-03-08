import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            const res = await API.post('/auth/register', { username: form.username, email: form.email, password: form.password });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <Helmet>
                <title>Subscribe — The Chronicle</title>
                <meta name="description" content="Create a Chronicle account to start writing blog posts, share your stories, and engage with a community of readers." />
            </Helmet>

            <div className="auth-card">
                <h2>Join The Chronicle</h2>
                <p className="auth-subtitle">Create your account and start publishing</p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" name="username" className="form-input" placeholder="johndoe" value={form.username} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" className="form-input" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Creating account...' : 'Subscribe'}</button>
                </form>
                <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
            </div>
        </div>
    );
}
