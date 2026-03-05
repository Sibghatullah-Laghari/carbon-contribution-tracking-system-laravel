import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

// Haversine formula — calculates distance in km between two GPS points
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Journey() {
    const navigate = useNavigate();
    const locationState = useLocation();
    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const redirectTimeoutRef = useRef(null);

    const [activityId, setActivityId] = useState("");
    const [step, setStep] = useState("idle"); // idle | started | ended | ticket | submitting | done
    const [startGPS, setStartGPS] = useState(null);
    const [endGPS, setEndGPS] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [stream, setStream] = useState(null);
    const [ticketPhoto, setTicketPhoto] = useState(null);
    const [ticketFile, setTicketFile] = useState(null);
    const [cameraError, setCameraError] = useState("");
    const [declaredKm, setDeclaredKm] = useState(0);

    // Timer
    useEffect(() => {
        let interval;
        if (step === "started" && startTime) {
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, startTime]);

    // Cleanup camera
    useEffect(() => {
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
    }, [stream]);

    useEffect(() => {
        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const stored = sessionStorage.getItem("journeySession");
        const parsed = stored ? JSON.parse(stored) : null;
        const state = locationState?.state || {};
        const id = state.activityId || parsed?.activityId || "";
        const km = state.declaredKm || parsed?.declaredKm || 0;
        if (!id) { setError("No activity found. Please submit an activity first."); return; }
        setActivityId(id);
        setDeclaredKm(parseFloat(km));
    }, []);

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const getGPS = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("Geolocation not supported")); return; }
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            err => {
                if (err.code === 1) reject(new Error("Location access denied. Please allow location in browser settings."));
                else if (err.code === 2) reject(new Error("Location unavailable. Please try again."));
                else reject(new Error("Location timed out. Please try again."));
            },
            { timeout: 12000, enableHighAccuracy: true }
        );
    });

    const handleStartJourney = async () => {
        setGpsError(""); setGpsLoading(true);
        try {
            const gps = await getGPS();
            setStartGPS(gps);
            setStartTime(Date.now());
            setStep("started");
            setMessage("Journey started! Travel to your destination and click End Journey when you arrive.");
        } catch (err) {
            setGpsError(err.message);
        } finally {
            setGpsLoading(false);
        }
    };

    const handleEndJourney = async () => {
        setGpsError(""); setGpsLoading(true);
        try {
            const gps = await getGPS();
            setEndGPS(gps);
            setEndTime(Date.now());
            setStep("ended");
            setMessage("Journey ended! Now take a photo of your ticket.");
            // Open camera for ticket
            openCamera();
        } catch (err) {
            setGpsError(err.message);
        } finally {
            setGpsLoading(false);
        }
    };

    const openCamera = async () => {
        setCameraError("");
        try {
            if (stream) stream.getTracks().forEach(t => t.stop());
            const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            setStream(media);
            if (videoRef.current) videoRef.current.srcObject = media;
            setStep("ticket");
        } catch (err) {
            if (err.name === "NotAllowedError") setCameraError("Camera access denied. Please allow camera permission.");
            else setCameraError("Unable to access camera: " + err.message);
        }
    };

    const captureTicket = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video.videoWidth) { setCameraError("Camera not ready. Please wait."); return; }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Timestamp overlay
        const now = new Date();
        const timestamp = now.toLocaleString("en-US", {
            year: "numeric", month: "short", day: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
        });
        const fontSize = Math.max(14, canvas.width / 40);
        const barH = fontSize * 2 + 16;
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, canvas.height - barH, canvas.width, barH);
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillText(`🎫 Ticket Proof — ${timestamp}`, 10, canvas.height - fontSize - 8);
        ctx.font = `${Math.max(11, canvas.width / 55)}px monospace`;
        ctx.fillStyle = "rgba(100,255,200,0.9)";
        if (endGPS) ctx.fillText(`📍 ${endGPS.lat.toFixed(5)}, ${endGPS.lon.toFixed(5)}`, 10, canvas.height - 6);
        ctx.font = `bold ${Math.max(11, canvas.width / 55)}px sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.textAlign = "right";
        ctx.fillText("CCTRS", canvas.width - 8, 20);
        ctx.textAlign = "left";

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const file = dataUrlToFile(dataUrl, `ticket_${Date.now()}.jpg`);
        setTicketPhoto(dataUrl);
        setTicketFile(file);
        if (stream) stream.getTracks().forEach(t => t.stop());
        setStream(null);
    };

    const computeResults = () => {
        if (!startGPS || !endGPS || !startTime || !endTime) return null;
        const distanceKm = haversineDistance(startGPS.lat, startGPS.lon, endGPS.lat, endGPS.lon);
        const durationHours = (endTime - startTime) / 3600000;
        const speedKmh = durationHours > 0 ? distanceKm / durationHours : 0;
        return { distanceKm, durationHours, speedKmh };
    };

    const validateJourney = (results) => {
        const { distanceKm, speedKmh } = results;
        const warnings = [];
        // Speed check: public transport is typically 10-120 km/h
        if (speedKmh > 150) warnings.push(`Speed too high (${speedKmh.toFixed(1)} km/h) — may not be public transport`);
        if (speedKmh < 2 && distanceKm > 0.5) warnings.push(`Speed too low (${speedKmh.toFixed(1)} km/h) — may be walking`);
        // Distance vs declared check
        if (declaredKm > 0) {
            const ratio = distanceKm / declaredKm;
            if (ratio < 0.3) warnings.push(`GPS distance (${distanceKm.toFixed(2)} km) is much less than declared (${declaredKm} km)`);
        }
        return warnings;
    };

    const handleSubmit = async () => {
        if (!ticketFile) { setError("Please capture your ticket photo first."); return; }
        const results = computeResults();
        if (!results) { setError("Journey data missing."); return; }

        setStep("submitting"); setError(""); setMessage("Submitting journey proof...");

        try {
            const formData = new FormData();
            formData.append("proofImageFile", ticketFile);
            formData.append("latitude", String(endGPS.lat));
            formData.append("longitude", String(endGPS.lon));
            formData.append("proofTime", new Date().toISOString().replace("Z", ""));
            formData.append("startLat", String(startGPS.lat));
            formData.append("startLon", String(startGPS.lon));
            formData.append("endLat", String(endGPS.lat));
            formData.append("endLon", String(endGPS.lon));
            formData.append("distanceKm", String(results.distanceKm.toFixed(3)));
            formData.append("durationMinutes", String(Math.round(results.durationHours * 60)));
            formData.append("averageSpeedKmh", String(results.speedKmh.toFixed(1)));
            formData.append("declaredKm", String(declaredKm));

            await api.post(`/api/activities/${activityId}/proof`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            sessionStorage.removeItem("journeySession");
            setStep("done");
            setMessage("✅ Journey proof submitted successfully!");
            redirectTimeoutRef.current = setTimeout(() => navigate("/my-activities"), 2500);
        } catch (err) {
            setStep("ticket");
            setError(err?.response?.data?.message || err?.message || "Submission failed");
        }
    };

    const handleBackStep = () => {
        const previousStepMap = {
            started: "idle",
            ended: "started",
            ticket: "ended",
            submitting: "ticket",
            done: "ticket",
        };
        const previousStep = previousStepMap[step];
        if (!previousStep) return;

        if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
            redirectTimeoutRef.current = null;
        }

        if (stream && (step === "ticket" || step === "done")) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }

        setError("");
        setGpsError("");
        setCameraError("");
        setMessage("");
        setStep(previousStep);
    };

    const results = computeResults();
    const warnings = results ? validateJourney(results) : [];

    return (
        <div className="page">
            <style>{`
        .journey-page { font-family: 'Inter', sans-serif; }

        .journey-steps {
          display: flex; gap: 0; margin-bottom: 2rem;
          border-radius: 12px; overflow: hidden;
          border: 1px solid #e2eeec;
        }
        .journey-step {
          flex: 1; padding: 0.75rem 0.5rem; text-align: center;
          font-size: 0.78rem; font-weight: 600; color: #aaa;
          background: #f8fffe; border-right: 1px solid #e2eeec;
          transition: all 0.3s;
        }
        .journey-step:last-child { border-right: none; }
        .journey-step.active { background: #2a9d8f; color: #fff; }
        .journey-step.done { background: #e8faf7; color: #2a9d8f; }
        .journey-step-icon { font-size: 1.2rem; display: block; margin-bottom: 2px; }

                .journey-back-btn {
                    margin-bottom: 1rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                @media (max-width: 640px) {
                    .journey-back-btn {
                        width: 100%;
                    }
                }

        .gps-card {
          background: #f8fffe; border: 1.5px solid #e2eeec;
          border-radius: 14px; padding: 1.2rem 1.5rem;
          margin-bottom: 1rem;
        }
        .gps-card-title { font-size: 0.8rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .gps-coords { font-size: 0.9rem; font-weight: 600; color: #1a1a1a; font-family: monospace; }
        .gps-time { font-size: 0.78rem; color: #888; margin-top: 0.25rem; }

        .timer {
          text-align: center; padding: 1.5rem;
          background: linear-gradient(135deg, #1a6b5e, #2a9d8f);
          border-radius: 16px; color: #fff; margin-bottom: 1rem;
        }
        .timer-label { font-size: 0.8rem; opacity: 0.8; margin-bottom: 0.5rem; letter-spacing: 0.08em; text-transform: uppercase; }
        .timer-value { font-size: 3rem; font-weight: 800; font-family: monospace; letter-spacing: 0.05em; }
        .timer-sub { font-size: 0.8rem; opacity: 0.75; margin-top: 0.5rem; }

        .results-card {
          background: #f0fff8; border: 1.5px solid #b2f0d4;
          border-radius: 14px; padding: 1.2rem 1.5rem; margin-bottom: 1rem;
        }
        .results-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-top: 0.75rem;
        }
        .result-item { text-align: center; }
        .result-value { font-size: 1.5rem; font-weight: 800; color: #1a7a4a; }
        .result-label { font-size: 0.75rem; color: #666; margin-top: 2px; }

        .warning-box {
          background: #fff8e1; border: 1.5px solid #ffd54f;
          border-radius: 10px; padding: 0.75rem 1rem;
          margin-bottom: 1rem; font-size: 0.85rem; color: #7a5c00;
        }
        .warning-box ul { margin: 0.5rem 0 0 1rem; }

        .ticket-preview {
          border-radius: 12px; overflow: hidden;
          border: 2px solid #2a9d8f; margin-bottom: 1rem;
        }
        .ticket-preview img { width: 100%; display: block; max-height: 280px; object-fit: cover; }

        .big-btn {
          width: 100%; padding: 1rem;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
          margin-bottom: 0.75rem;
        }
        .btn-start {
          background: #2a9d8f; color: #fff;
          box-shadow: 0 4px 16px rgba(42,157,143,0.35);
        }
        .btn-start:hover:not(:disabled) { background: #238a7e; transform: translateY(-1px); }
        .btn-end {
          background: #e63946; color: #fff;
          box-shadow: 0 4px 16px rgba(230,57,70,0.3);
        }
        .btn-end:hover:not(:disabled) { background: #c62b37; transform: translateY(-1px); }
        .btn-capture {
          background: #f4a261; color: #fff;
          box-shadow: 0 4px 16px rgba(244,162,97,0.3);
        }
        .btn-capture:hover:not(:disabled) { background: #e08040; transform: translateY(-1px); }
        .btn-submit {
          background: #2a9d8f; color: #fff;
          box-shadow: 0 4px 16px rgba(42,157,143,0.35);
        }
        .btn-submit:hover:not(:disabled) { background: #238a7e; transform: translateY(-1px); }
        .big-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

        .video { width: 100%; border-radius: 12px; background: #000; }
        canvas { display: none; }

        .perm-box {
          background: #fffbea; border: 1px solid #f0c040;
          border-radius: 12px; padding: 1rem; margin-bottom: 1rem;
          font-size: 0.85rem; color: #7a5c00;
        }
        .perm-box strong { display: block; margin-bottom: 0.3rem; }

        .done-box {
          text-align: center; padding: 2rem;
        }
        .done-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
        .done-box h2 { font-size: 1.5rem; font-weight: 800; color: #1a1a1a; margin-bottom: 0.5rem; }
        .done-box p { color: #666; font-size: 0.9rem; }
      `}</style>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-kicker">Public Transport Verification</div>
                        <h1>Journey Tracker</h1>
                    </div>
                    <div className="card-hint">GPS-verified journey proof with ticket photo</div>
                </div>

                {step !== "idle" && (
                    <button className="btn btn-secondary journey-back-btn" onClick={handleBackStep}>
                        <span aria-hidden="true">←</span>
                        <span>Back</span>
                    </button>
                )}

                {/* STEP INDICATOR */}
                <div className="journey-steps">
                    {[
                        { key: "idle", icon: "📍", label: "Start" },
                        { key: "started", icon: "🚌", label: "Travelling" },
                        { key: "ended", icon: "🏁", label: "Arrived" },
                        { key: "ticket", icon: "🎫", label: "Ticket" },
                        { key: "done", icon: "✅", label: "Done" },
                    ].map((s, i) => {
                        const steps = ["idle", "started", "ended", "ticket", "submitting", "done"];
                        const currentIdx = steps.indexOf(step);
                        const thisIdx = steps.indexOf(s.key);
                        return (
                            <div key={s.key} className={`journey-step ${currentIdx === thisIdx ? "active" : currentIdx > thisIdx ? "done" : ""}`}>
                                <span className="journey-step-icon">{s.icon}</span>
                                {s.label}
                            </div>
                        );
                    })}
                </div>

                {error && <div className="error" style={{marginBottom:"1rem"}}>{error}</div>}
                {gpsError && (
                    <div className="perm-box">
                        <strong>📍 Location Error</strong>
                        {gpsError}
                    </div>
                )}

                {/* ── STEP: IDLE ── */}
                {step === "idle" && (
                    <div>
                        <div className="gps-card" style={{background:"#f0fff8", border:"1.5px solid #b2f0d4"}}>
                            <div className="gps-card-title">How it works</div>
                            <div style={{fontSize:"0.875rem", color:"#444", lineHeight:1.8}}>
                                <div>1️⃣ Click <strong>Start Journey</strong> — your GPS location is recorded</div>
                                <div>2️⃣ Board your bus/train and travel to your destination</div>
                                <div>3️⃣ Click <strong>End Journey</strong> when you arrive</div>
                                <div>4️⃣ Take a photo of your <strong>ticket or pass</strong></div>
                                <div>5️⃣ Submit — our system verifies your distance and speed</div>
                            </div>
                        </div>
                        {declaredKm > 0 && (
                            <div style={{fontSize:"0.875rem", color:"#666", marginBottom:"1rem", background:"#f8fffe", padding:"0.75rem 1rem", borderRadius:"10px", border:"1px solid #e2eeec"}}>
                                📏 Declared distance: <strong style={{color:"#2a9d8f"}}>{declaredKm} km</strong>
                            </div>
                        )}
                        <button className="big-btn btn-start" onClick={handleStartJourney} disabled={gpsLoading}>
                            {gpsLoading ? "Getting GPS..." : "📍 Start Journey"}
                        </button>
                    </div>
                )}

                {/* ── STEP: STARTED (travelling) ── */}
                {step === "started" && (
                    <div>
                        <div className="timer">
                            <div className="timer-label">Journey Time</div>
                            <div className="timer-value">{formatTime(elapsed)}</div>
                            <div className="timer-sub">Keep app open while travelling</div>
                        </div>
                        <div className="gps-card">
                            <div className="gps-card-title">📍 Start Location</div>
                            <div className="gps-coords">{startGPS?.lat.toFixed(6)}, {startGPS?.lon.toFixed(6)}</div>
                            <div className="gps-time">{new Date(startTime).toLocaleTimeString()}</div>
                        </div>
                        <div style={{background:"#fff8e1", border:"1px solid #ffd54f", borderRadius:"10px", padding:"0.75rem 1rem", marginBottom:"1rem", fontSize:"0.85rem", color:"#7a5c00"}}>
                            ⚠️ Don't close this page while travelling!
                        </div>
                        <button className="big-btn btn-end" onClick={handleEndJourney} disabled={gpsLoading}>
                            {gpsLoading ? "Getting GPS..." : "🏁 End Journey"}
                        </button>
                    </div>
                )}

                {/* ── STEP: ENDED / TICKET ── */}
                {(step === "ended" || step === "ticket") && (
                    <div>
                        {/* GPS Summary */}
                        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"1rem"}}>
                            <div className="gps-card">
                                <div className="gps-card-title">🟢 Start</div>
                                <div className="gps-coords" style={{fontSize:"0.8rem"}}>{startGPS?.lat.toFixed(5)}, {startGPS?.lon.toFixed(5)}</div>
                                <div className="gps-time">{startTime && new Date(startTime).toLocaleTimeString()}</div>
                            </div>
                            <div className="gps-card">
                                <div className="gps-card-title">🔴 End</div>
                                <div className="gps-coords" style={{fontSize:"0.8rem"}}>{endGPS?.lat.toFixed(5)}, {endGPS?.lon.toFixed(5)}</div>
                                <div className="gps-time">{endTime && new Date(endTime).toLocaleTimeString()}</div>
                            </div>
                        </div>

                        {/* Results */}
                        {results && (
                            <div className="results-card">
                                <div style={{fontWeight:"700", color:"#1a7a4a", fontSize:"0.875rem"}}>📊 Journey Summary</div>
                                <div className="results-grid">
                                    <div className="result-item">
                                        <div className="result-value">{results.distanceKm.toFixed(2)}</div>
                                        <div className="result-label">km travelled</div>
                                    </div>
                                    <div className="result-item">
                                        <div className="result-value">{formatTime(elapsed)}</div>
                                        <div className="result-label">duration</div>
                                    </div>
                                    <div className="result-item">
                                        <div className="result-value">{results.speedKmh.toFixed(1)}</div>
                                        <div className="result-label">avg km/h</div>
                                    </div>
                                </div>
                                {declaredKm > 0 && (
                                    <div style={{marginTop:"0.75rem", fontSize:"0.8rem", color:"#666", borderTop:"1px solid #b2f0d4", paddingTop:"0.75rem"}}>
                                        Declared: <strong>{declaredKm} km</strong> &nbsp;|&nbsp;
                                        GPS measured: <strong>{results.distanceKm.toFixed(2)} km</strong> &nbsp;|&nbsp;
                                        <span style={{color: Math.abs(results.distanceKm - declaredKm) < declaredKm * 0.5 ? "#1a7a4a" : "#e63946", fontWeight:"700"}}>
                      {Math.abs(results.distanceKm - declaredKm) < declaredKm * 0.5 ? "✓ Matches" : "⚠️ Mismatch"}
                    </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Warnings */}
                        {warnings.length > 0 && (
                            <div className="warning-box">
                                <strong>⚠️ Validation Warnings</strong>
                                <ul>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                                <div style={{marginTop:"0.5rem", fontSize:"0.8rem"}}>Your submission will be flagged for admin review.</div>
                            </div>
                        )}

                        {/* Ticket Camera */}
                        <div style={{marginBottom:"1rem"}}>
                            <div style={{fontWeight:"700", color:"#333", marginBottom:"0.75rem", fontSize:"0.9rem"}}>
                                🎫 Capture Your Ticket / Pass
                            </div>
                            {cameraError && (
                                <div className="perm-box">
                                    <strong>📷 Camera needed</strong>{cameraError}
                                </div>
                            )}
                            {!ticketPhoto && (
                                <>
                                    <video ref={videoRef} autoPlay playsInline className="video" style={{marginBottom:"0.75rem"}} />
                                    <canvas ref={canvasRef} />
                                    <button className="big-btn btn-capture" onClick={captureTicket} disabled={!stream}>
                                        📸 Capture Ticket Photo
                                    </button>
                                    {cameraError && (
                                        <button className="big-btn btn-start" onClick={openCamera}>
                                            🔄 Retry Camera
                                        </button>
                                    )}
                                </>
                            )}
                            {ticketPhoto && (
                                <div>
                                    <div className="ticket-preview">
                                        <img src={ticketPhoto} alt="ticket" />
                                    </div>
                                    <button className="btn" onClick={() => { setTicketPhoto(null); setTicketFile(null); openCamera(); }}
                                            style={{marginBottom:"0.75rem", width:"100%"}}>
                                        🔄 Retake Photo
                                    </button>
                                </div>
                            )}
                        </div>

                        {message && <div className="success" style={{marginBottom:"1rem"}}>{message}</div>}

                        <button
                            className="big-btn btn-submit"
                            onClick={handleSubmit}
                            disabled={!ticketPhoto || step === "submitting"}
                        >
                            {step === "submitting" ? "Submitting..." : "✅ Submit Journey Proof →"}
                        </button>
                    </div>
                )}

                {/* ── STEP: DONE ── */}
                {step === "done" && (
                    <div className="done-box">
                        <span className="done-icon">🌱</span>
                        <h2>Journey Verified!</h2>
                        <p>Your public transport journey has been submitted for review.<br />
                            Points will be added once an admin approves it.</p>
                        <div style={{marginTop:"1.5rem", fontSize:"0.85rem", color:"#2a9d8f", fontWeight:"600"}}>
                            Redirecting to your activities...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function dataUrlToFile(dataUrl, filename) {
    const [header, data] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new File([array], filename, { type: mime });
}