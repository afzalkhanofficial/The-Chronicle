import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
            <Helmet>
                <title>Page Not Found — The Chronicle</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <h1 style={{ fontSize: 'clamp(6rem, 15vw, 10rem)', fontFamily: 'var(--font-serif)', lineHeight: 1, margin: 0, color: 'var(--color-text-muted)' }}>404</h1>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: '1rem' }}>Article Not Found</h2>
            <p style={{ maxWidth: '30rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                The story you are looking for has been moved, archived, or never existed in our publication.
                Our editorial team is looking into the missing pages.
            </p>
            <Link to="/" className="btn btn-primary btn-lg">Return to Front Page</Link>
        </div>
    );
}
