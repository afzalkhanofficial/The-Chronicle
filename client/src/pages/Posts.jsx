import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import API from '../utils/api';
import PostCard from '../components/PostCard';

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const activeCategory = searchParams.get('category') || '';
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                let url = `/posts?page=${page}&limit=9`;
                if (activeCategory) url += `&category=${activeCategory}`;
                if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
                if (sort === 'popular') url += '&sort=popular';
                else if (sort === 'oldest') url += '&sort=oldest';

                const res = await API.get(url);
                setPosts(res.data.posts);
                setTotalPages(res.data.pages);
                setTotal(res.data.total);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchPosts();
    }, [page, activeCategory, searchQuery, sort]);

    useEffect(() => {
        API.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    }, []);

    const handleCategoryFilter = (catId) => {
        setPage(1);
        const newParams = new URLSearchParams(searchParams);
        if (catId === activeCategory) { newParams.delete('category'); }
        else { newParams.set('category', catId); }
        setSearchParams(newParams);
    };

    const clearSearch = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('search');
        setSearchParams(newParams);
        setPage(1);
    };

    return (
        <div className="page-wrapper">
            <Helmet>
                <title>{searchQuery ? `Search: ${searchQuery}` : 'All Stories'} — The Chronicle</title>
                <meta name="description" content="Browse all stories on The Chronicle. Filter by category, search by keyword, and sort by date or popularity." />
            </Helmet>

            <div className="content-container" style={{ padding: '2rem' }}>

                {/* Page header */}
                <div style={{ borderBottom: '4px solid #000', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 900 }}>
                        {searchQuery ? `Search Results` : 'All Stories'}
                    </h1>
                    {searchQuery && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                Showing results for: <strong>"{searchQuery}"</strong>
                            </span>
                            <button className="btn btn-secondary btn-sm" onClick={clearSearch}>Clear</button>
                        </div>
                    )}
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
                        {total} {total === 1 ? 'Story' : 'Stories'} Found
                    </span>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="filters-bar">
                        <button className={`filter-btn ${!activeCategory ? 'active' : ''}`} onClick={() => { const newP = new URLSearchParams(searchParams); newP.delete('category'); setSearchParams(newP); setPage(1); }}>All</button>
                        {categories.map(cat => (
                            <button key={cat._id} className={`filter-btn ${activeCategory === cat._id ? 'active' : ''}`} onClick={() => handleCategoryFilter(cat._id)}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    <select className="form-input" style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                        <option value="newest">Newest First</option>
                        <option value="popular">Most Popular</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="loader"><div className="spinner"></div></div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <p style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                            No stories found. Try adjusting your filters.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="article-grid-3col">
                            {posts.map(post => <PostCard key={post._id} post={post} />)}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-wrapper">
                                <button className="page-prev" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← PREV</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                                ))}
                                <button className="page-next" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>NEXT →</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
