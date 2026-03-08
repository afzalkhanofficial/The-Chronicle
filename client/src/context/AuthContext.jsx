import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('blogUser');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('blogUser'); }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('blogUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('blogUser');
    };

    const isAdmin = user?.role === 'admin';
    const isAuthor = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isAuthor }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
