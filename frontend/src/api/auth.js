/**
 * Decodes the JWT stored in localStorage and returns the role claim.
 * This is the single source of truth for role-based UI decisions.
 * @returns {string|null} role value from JWT payload, or null if absent/invalid
 */
export function getRoleFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || null;
    } catch {
        return null;
    }
}
