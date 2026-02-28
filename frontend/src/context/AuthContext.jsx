import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * Decodes a JWT and returns { email, role } if valid and not expired.
 * Returns null if the token is missing, malformed, or expired.
 */
function decodeToken(token) {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Enforce expiry check on the client side
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return null; // Token expired — treat as unauthenticated
        }
        if (!payload.sub || !payload.role) return null;
        return { email: payload.sub, role: payload.role };
    } catch {
        return null;
    }
}

/**
 * Clears all auth-related keys from localStorage.
 * Single function so nothing is accidentally left behind.
 */
function clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Initialize from stored token; clear storage if token is already invalid/expired
        const token = localStorage.getItem('token');
        const decoded = decodeToken(token);
        if (!decoded && token) {
            clearStorage();
        }
        return decoded;
    });

    /**
     * Call after a successful login response.
     * Stores the token and role in localStorage AND updates React state atomically.
     */
    const login = useCallback((token, role, email) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('email', email);
        setUser(decodeToken(token));
    }, []);

    /**
     * Fully clears the session — localStorage + React state.
     * Guaranteed to remove all auth data on every logout path.
     */
    const logout = useCallback(() => {
        clearStorage();
        setUser(null);
    }, []);

    /**
     * Cross-tab synchronisation.
     * If another tab logs in as a different user or logs out, this tab
     * immediately reflects the new (or absent) identity — preventing role
     * leakage between sessions opened in the same browser.
     */
    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key === 'token') {
                if (!event.newValue) {
                    // Another tab logged out — sign out here too
                    setUser(null);
                } else {
                    // Another tab logged in — re-read and validate its token
                    const decoded = decodeToken(event.newValue);
                    if (!decoded) {
                        clearStorage();
                    }
                    setUser(decoded);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Re-validate the stored token whenever the component tree mounts
    useEffect(() => {
        const token = localStorage.getItem('token');
        const decoded = decodeToken(token);
        if (!decoded && token) {
            // Stale / expired / corrupt token — purge it
            clearStorage();
        }
        setUser(decoded);
    }, []);

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        role: user?.role ?? null,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook for consuming auth context throughout the app.
 * Throws if used outside <AuthProvider>.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an <AuthProvider>');
    }
    return context;
}
