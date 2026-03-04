import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuth2Callback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const role = searchParams.get("role");

        if (token) {
            // Save token same way as normal login
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            // Redirect based on role
            if (role === "ADMIN") {
                navigate("/admin-cctrs-2024", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        } else {
            navigate("/login?error=oauth_failed", { replace: true });
        }
    }, []);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(160deg, #0f4d43 0%, #2a9d8f 100%)",
            flexDirection: "column", gap: "1rem"
        }}>
            <div style={{
                width: 48, height: 48, border: "4px solid rgba(255,255,255,0.3)",
                borderTop: "4px solid #fff", borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
            }}></div>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>
                Signing you in with Google...
            </p>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
