import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="site-footer">
            {/* Footer grid */}
            <div className="site-footer-grid">
                <div className="footer-brand">
                    <h2>The Chronicle</h2>
                    <p>Dedicated to the rigorous pursuit of truth in the digital age. Our mission is to provide clarity through high-quality, long-form journalism and insightful blog content.</p>
                </div>
                <div>
                    <h4 className="footer-col-title">Navigation</h4>
                    <ul className="footer-col-list">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/posts">All Stories</Link></li>
                        <li><Link to="/login">Sign In</Link></li>
                        <li><Link to="/register">Subscribe</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="footer-col-title">Connect</h4>
                    <ul className="footer-col-list">
                        <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter / X</a></li>
                        <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
                        <li><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li>
                        <li><Link to="/posts">RSS Feed</Link></li>
                    </ul>
                </div>
            </div>

            {/* Footer bottom */}
            <div className="footer-bottom">
                <span>&copy; {new Date().getFullYear()} THE CHRONICLE MEDIA GROUP. ALL RIGHTS RESERVED.</span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span>PUBLISHED DIGITALLY</span>
                    <span>|</span>
                    <span>DISTRIBUTED GLOBALLY</span>
                </div>
            </div>
        </footer>
    );
}
