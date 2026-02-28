/**
 * Decodes the JWT stored in localStorage and returns the role claim.
 * Also validates that the token has not expired.
 * Returns null if the token is absent, malformed, or expired.
 */
export function getRoleFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Enforce client-side expiry check
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return null;
        }
        return payload.role || null;
    } catch {
        return null;
    }
}
