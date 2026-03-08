import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isAdmin, isAuthor } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.body.classList.add('dark-mode');
        }
    }, []);

    // Toggle dark/light mode
    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
    const isActive = (path) => location.pathname === path ? 'active' : '';
    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) { navigate(`/posts?search=${encodeURIComponent(search)}`); setSearch(''); }
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            {/* Ticker bar */}
            <div className="ticker-bar">
                <span>Welcome to The Chronicle — Your Digital Broadsheet</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className="live-dot"></span>
                    <span>Live Updates</span>
                </div>
            </div>

            {/* Site header */}
            <header className="site-header">
                {/* Meta row */}
                <div className="header-meta-row">
                    <span>The Digital Broadsheet</span>
                    <span>{today}</span>
                </div>

                {/* Main header */}
                <div className="header-main">
                    <div className="header-left">
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>search</span>
                        <form onSubmit={handleSearch}>
                            <input
                                className="search-input-header"
                                type="text"
                                placeholder="Search the archives..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                    </div>

                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 className="site-title">The Chronicle</h1>
                    </Link>

                    <div className="header-right">
                        {/* Dark/Light toggle */}
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <span className="material-symbols-outlined">
                                {darkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        {user ? (
                            <>
                                <Link to="/profile" className="btn-subscribe" style={{ background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border-dark)' }}>
                                    {user.username}
                                </Link>
                                <button className="btn-subscribe" onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-subscribe" style={{ background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border-dark)' }}>
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn-subscribe">Subscribe</Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="main-nav" style={{ justifyContent: 'space-between', alignItems: 'center' }}>

                    <div className="nav-side-text">
                        The Digital Broadsheet
                    </div>

                    <ul className={`nav-links-list ${menuOpen ? 'open' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                        <li><Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link></li>
                        <li><Link to="/posts" className={isActive('/posts')} onClick={() => setMenuOpen(false)}>All Stories</Link></li>
                        {isAuthor && (
                            <li><Link to="/create" className={isActive('/create')} onClick={() => setMenuOpen(false)}>Write</Link></li>
                        )}
                        {isAdmin && (
                            <li><Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>Admin</Link></li>
                        )}
                        {user && (
                            <li><Link to="/profile" className={isActive('/profile')} onClick={() => setMenuOpen(false)}>My Desk</Link></li>
                        )}
                    </ul>

                    <div className="nav-side-text right">
                        {today}
                    </div>

                    <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
                    </button>
                </nav>
            </header>
        </>
    );
}
