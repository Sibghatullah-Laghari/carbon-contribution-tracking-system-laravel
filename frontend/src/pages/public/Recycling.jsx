import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function Recycling() {
    const navigate = useNavigate();
    const locationState = useLocation();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [activityId, setActivityId] = useState("");
    const [declaredKg, setDeclaredKg] = useState(0);
    const [step, setStep] = useState("intro"); // intro | scale | before | after | review | submitting | done
    const [stream, setStream] = useState(null);
    const [photos, setPhotos] = useState({ scale: null, before: null, after: null });
    const [location, setLocation] = useState({ lat: null, lon: null });
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState("not_started"); // not_started | loading | got | failed
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [cameraError, setCameraError] = useState("");
    const [activeCamera, setActiveCamera] = useState(null); // which photo we're taking

    useEffect(() => {
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
    }, [stream]);

    useEffect(() => {
        const stored = sessionStorage.getItem("recyclingSession");
        const parsed = stored ? JSON.parse(stored) : null;
        const state = locationState?.state || {};
        const id = state.activityId || parsed?.activityId || "";
        const kg = state.declaredKg || parsed?.declaredKg || 0;
        if (!id) { setError("No activity found. Please submit an activity first."); return; }
        setActivityId(id);
        setDeclaredKg(parseFloat(kg));
        // Encourage GPS from the start
        getLocation();
    }, []);

    const getLocation = () => {
        setLocationStatus("loading"); setLocationLoading(true);
        if (!navigator.geolocation) { setLocationStatus("failed"); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                setLocationStatus("got"); setLocationLoading(false);
            },
            () => { setLocationStatus("failed"); setLocationLoading(false); },
            { timeout: 12000, enableHighAccuracy: true }
        );
    };

    const openCamera = async (photoType) => {
        setCameraError("");
        setActiveCamera(photoType);
        try {
            if (stream) stream.getTracks().forEach(t => t.stop());
            const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            setStream(media);
            if (videoRef.current) videoRef.current.srcObject = media;
        } catch (err) {
            if (err.name === "NotAllowedError") setCameraError("Camera access denied. Please allow camera permission in your browser settings.");
            else setCameraError("Unable to access camera: " + err.message);
        }
    };

    const capturePhoto = (photoType) => {
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
        const smallFont = Math.max(11, canvas.width / 55);
        const barH = fontSize + smallFont + 20;

        // Dark bar
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

        // Photo type label
        const labels = { scale: "⚖️ Weight Proof", before: "📦 Before Drop-off", after: "✅ After Drop-off" };
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillText(`${labels[photoType]} — ${timestamp}`, 10, canvas.height - smallFont - 8);

        // GPS
        ctx.font = `${smallFont}px monospace`;
        if (location.lat) {
            ctx.fillStyle = "rgba(100,255,200,0.95)";
            ctx.fillText(`📍 ${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}`, 10, canvas.height - 6);
        } else {
            ctx.fillStyle = "rgba(255,200,100,0.85)";
            ctx.fillText("📍 Location not captured", 10, canvas.height - 6);
        }

        // Declared kg
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `bold ${smallFont}px monospace`;
        ctx.textAlign = "right";
        ctx.fillText(`${declaredKg}kg — CCTRS`, canvas.width - 8, 20);
        ctx.textAlign = "left";

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const file = dataUrlToFile(dataUrl, `recycling_${photoType}_${Date.now()}.jpg`);

        setPhotos(prev => ({ ...prev, [photoType]: { dataUrl, file, timestamp } }));
        if (stream) stream.getTracks().forEach(t => t.stop());
        setStream(null);
        setActiveCamera(null);
    };

    const retakePhoto = (photoType) => {
        setPhotos(prev => ({ ...prev, [photoType]: null }));
        openCamera(photoType);
    };

    const handleSubmit = async () => {
        setError(""); setMessage("");
        if (!photos.scale || !photos.before || !photos.after) {
            setError("Please capture all three required photos before submitting.");
            return;
        }
        if (declaredKg < 5) {
            setError("Minimum 5 kg required for recycling activity.");
            return;
        }

        setStep("submitting");
        try {
            // The backend stores a single proof_image per activity and transitions
            // status DECLARED → PROOF_SUBMITTED in one atomic update.
            // Sending additional requests for the same activityId after the first
            // succeeds would cause "Activity is not in DECLARED state" because the
            // status is already PROOF_SUBMITTED. Submit only once using the scale
            // photo, which is the primary weight-evidence for a recycling activity.
            const formData = new FormData();
            formData.append("proofImageFile", photos.scale.file);
            formData.append("latitude", String(location.lat || 0));
            formData.append("longitude", String(location.lon || 0));
            formData.append("proofTime", new Date().toISOString().replace("Z", ""));
            await api.post(`/api/activities/${activityId}/proof`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            sessionStorage.removeItem("recyclingSession");
            setStep("done");
            setTimeout(() => navigate("/my-activities"), 2500);
        } catch (err) {
            setStep("review");
            setError(err?.response?.data?.message || err?.message || "Submission failed");
        }
    };

    const allPhotosDone = photos.scale && photos.before && photos.after;
    const steps = ["intro", "scale", "before", "after", "review"];
    const currentStepIdx = steps.indexOf(step);

    return (
        <div className="page">
            <style>{`
        .rec-steps {
          display: flex; gap: 0; margin-bottom: 1.5rem;
          border-radius: 12px; overflow: hidden; border: 1px solid #e2eeec;
        }
        .rec-step {
          flex: 1; padding: 0.65rem 0.4rem; text-align: center;
          font-size: 0.75rem; font-weight: 600; color: #aaa;
          background: #f8fffe; border-right: 1px solid #e2eeec; transition: all 0.3s;
        }
        .rec-step:last-child { border-right: none; }
        .rec-step.active { background: #2a9d8f; color: #fff; }
        .rec-step.done { background: #e8faf7; color: #2a9d8f; }
        .rec-step-icon { font-size: 1.1rem; display: block; margin-bottom: 2px; }

        .photo-slot {
          border: 2px dashed #b2e8e0; border-radius: 14px;
          padding: 1.5rem; text-align: center; margin-bottom: 1rem;
          background: #f8fffe; transition: all 0.2s; cursor: pointer;
        }
        .photo-slot:hover { border-color: #2a9d8f; background: #f0fff8; }
        .photo-slot.captured { border: 2px solid #2a9d8f; padding: 0; overflow: hidden; }
        .photo-slot img { width: 100%; display: block; max-height: 220px; object-fit: cover; border-radius: 12px; }
        .photo-slot-icon { font-size: 2.5rem; margin-bottom: 0.5rem; display: block; }
        .photo-slot-title { font-weight: 700; color: #333; font-size: 0.9rem; margin-bottom: 0.3rem; }
        .photo-slot-desc { font-size: 0.8rem; color: #888; }
        .photo-slot-done {
          position: relative;
        }
        .photo-slot-done-badge {
          position: absolute; top: 8px; right: 8px;
          background: #2a9d8f; color: #fff;
          font-size: 0.7rem; font-weight: 700;
          padding: 3px 8px; border-radius: 20px;
        }
        .photo-slot-retake {
          position: absolute; bottom: 8px; right: 8px;
          background: rgba(0,0,0,0.6); color: #fff;
          font-size: 0.7rem; font-weight: 600;
          padding: 4px 10px; border-radius: 8px;
          border: none; cursor: pointer;
        }

        .gps-banner {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem;
          font-size: 0.82rem; font-weight: 600;
        }
        .gps-got { background: #e8faf7; color: #1a7a4a; border: 1px solid #b2e8e0; }
        .gps-loading { background: #fff8e1; color: #7a5c00; border: 1px solid #ffd54f; }
        .gps-failed { background: #fff0f0; color: #cc0000; border: 1px solid #ffcccc; }

        .video-wrap { position: relative; margin-bottom: 0.75rem; }
        .video { width: 100%; border-radius: 12px; background: #000; }
        canvas { display: none; }

        .big-btn {
          width: 100%; padding: 0.9rem;
          font-size: 0.95rem; font-weight: 700;
          border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
          margin-bottom: 0.75rem;
        }
        .btn-teal { background: #2a9d8f; color: #fff; box-shadow: 0 4px 16px rgba(42,157,143,0.3); }
        .btn-teal:hover:not(:disabled) { background: #238a7e; transform: translateY(-1px); }
        .btn-orange { background: #f4a261; color: #fff; }
        .btn-orange:hover:not(:disabled) { background: #e08040; transform: translateY(-1px); }
        .big-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

        .review-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;
        }
        .review-photo { border-radius: 10px; overflow: hidden; border: 2px solid #e2eeec; }
        .review-photo img { width: 100%; height: 100px; object-fit: cover; display: block; }
        .review-photo-label {
          background: #f8fffe; text-align: center;
          font-size: 0.7rem; font-weight: 700; color: #2a9d8f; padding: 4px;
        }

        .info-card {
          background: #f8fffe; border: 1.5px solid #e2eeec;
          border-radius: 14px; padding: 1.2rem 1.5rem; margin-bottom: 1rem;
        }

        .done-box { text-align: center; padding: 2rem; }
        .done-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
        .done-box h2 { font-size: 1.5rem; font-weight: 800; color: #1a1a1a; margin-bottom: 0.5rem; }
        .done-box p { color: #666; font-size: 0.9rem; line-height: 1.7; }

        .perm-box {
          background: #fffbea; border: 1px solid #f0c040;
          border-radius: 10px; padding: 0.75rem 1rem;
          margin-bottom: 1rem; font-size: 0.82rem; color: #7a5c00;
        }

        .progress-bar-wrap {
          background: #e8f5f2; border-radius: 100px; height: 8px; margin-bottom: 1.5rem; overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%; background: linear-gradient(90deg, #2a9d8f, #3dbda8);
          border-radius: 100px; transition: width 0.4s ease;
        }
      `}</style>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-kicker">Recycling Verification</div>
                        <h1>♻️ Recycling Proof</h1>
                    </div>
                    <div className="card-hint">3 photos required — scale, before & after drop-off</div>
                </div>

                {/* STEP INDICATOR */}
                <div className="rec-steps">
                    {[
                        { key: "intro", icon: "ℹ️", label: "Info" },
                        { key: "scale", icon: "⚖️", label: "Scale" },
                        { key: "before", icon: "📦", label: "Before" },
                        { key: "after", icon: "✅", label: "After" },
                        { key: "review", icon: "🔍", label: "Review" },
                    ].map((s) => {
                        const idx = steps.indexOf(s.key);
                        return (
                            <div key={s.key} className={`rec-step ${step === s.key ? "active" : currentStepIdx > idx ? "done" : ""}`}>
                                <span className="rec-step-icon">{currentStepIdx > idx ? "✓" : s.icon}</span>
                                {s.label}
                            </div>
                        );
                    })}
                </div>

                {/* PROGRESS BAR */}
                <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }} />
                </div>

                {/* GPS BANNER */}
                <div className={`gps-banner ${locationStatus === "got" ? "gps-got" : locationStatus === "loading" ? "gps-loading" : locationStatus === "failed" ? "gps-failed" : "gps-loading"}`}>
                    {locationStatus === "got" && <><span>📍</span><span>Location captured — {location.lat?.toFixed(4)}, {location.lon?.toFixed(4)}</span></>}
                    {locationStatus === "loading" && <><span>⏳</span><span>Getting your location...</span></>}
                    {locationStatus === "failed" && <><span>⚠️</span><span>Location not captured (optional) — <button onClick={getLocation} style={{background:"none", border:"none", color:"#cc0000", cursor:"pointer", fontWeight:"700", textDecoration:"underline"}}>Retry</button></span></>}
                    {locationStatus === "not_started" && <><span>📍</span><span>Location optional but encouraged</span></>}
                </div>

                {error && <div className="error" style={{marginBottom:"1rem"}}>{error}</div>}

                {/* ── STEP: INTRO ── */}
                {step === "intro" && (
                    <div>
                        <div className="info-card">
                            <div style={{fontWeight:"700", color:"#2a9d8f", marginBottom:"0.75rem", fontSize:"0.95rem"}}>
                                📋 What you need to do
                            </div>
                            <div style={{fontSize:"0.875rem", color:"#444", lineHeight:2}}>
                                <div>⚖️ <strong>Step 1 — Scale Photo:</strong> Place your recyclables on a scale. Take a clear photo showing the weight.</div>
                                <div>📦 <strong>Step 2 — Before Photo:</strong> Photo of your full recycling bags before handing over to kabari wala.</div>
                                <div>✅ <strong>Step 3 — After Photo:</strong> Photo after drop-off — empty bags or kabari wala taking materials.</div>
                            </div>
                        </div>

                        <div style={{background:"#fff8e1", border:"1px solid #ffd54f", borderRadius:"10px", padding:"0.75rem 1rem", marginBottom:"1rem", fontSize:"0.85rem", color:"#7a5c00"}}>
                            ⚠️ Minimum <strong>5 kg</strong> required. Your declared quantity: <strong style={{color: declaredKg >= 5 ? "#1a7a4a" : "#e63946"}}>{declaredKg} kg {declaredKg >= 5 ? "✓" : "✗ (too low)"}</strong>
                        </div>

                        {declaredKg < 5 ? (
                            <div className="error">Declared quantity is less than 5 kg minimum. Please go back and update your activity.</div>
                        ) : (
                            <button className="big-btn btn-teal" onClick={() => { setStep("scale"); openCamera("scale"); }}>
                                ⚖️ Start — Capture Scale Photo →
                            </button>
                        )}
                    </div>
                )}

                {/* ── STEP: SCALE ── */}
                {step === "scale" && (
                    <div>
                        <div className="info-card" style={{marginBottom:"1rem"}}>
                            <div style={{fontWeight:"700", color:"#333", marginBottom:"0.3rem"}}>⚖️ Step 1: Weight on Scale</div>
                            <div style={{fontSize:"0.82rem", color:"#666"}}>Place ALL your recyclables on a scale. Make sure the weight reading is clearly visible in the photo.</div>
                        </div>

                        {cameraError && <div className="perm-box"><strong>📷 Camera needed</strong>{cameraError}</div>}

                        {!photos.scale ? (
                            <>
                                <div className="video-wrap">
                                    <video ref={videoRef} autoPlay playsInline className="video" />
                                    <canvas ref={canvasRef} />
                                </div>
                                <button className="big-btn btn-orange" onClick={() => capturePhoto("scale")} disabled={!stream || activeCamera !== "scale"}>
                                    📸 Capture Scale Photo
                                </button>
                                {cameraError && <button className="big-btn btn-teal" onClick={() => openCamera("scale")}>🔄 Retry Camera</button>}
                            </>
                        ) : (
                            <div>
                                <div className="photo-slot-done" style={{position:"relative", marginBottom:"1rem"}}>
                                    <img src={photos.scale.dataUrl} alt="scale" style={{width:"100%", borderRadius:"12px", maxHeight:"280px", objectFit:"cover"}} />
                                    <span className="photo-slot-done-badge">✓ Captured</span>
                                    <button className="photo-slot-retake" onClick={() => retakePhoto("scale")}>🔄 Retake</button>
                                </div>
                                <button className="big-btn btn-teal" onClick={() => { setStep("before"); openCamera("before"); }}>
                                    Next — Before Photo 📦 →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── STEP: BEFORE ── */}
                {step === "before" && (
                    <div>
                        <div className="info-card" style={{marginBottom:"1rem"}}>
                            <div style={{fontWeight:"700", color:"#333", marginBottom:"0.3rem"}}>📦 Step 2: Before Drop-off</div>
                            <div style={{fontSize:"0.82rem", color:"#666"}}>Take a photo of your full recycling bags or materials BEFORE handing them over to the kabari wala.</div>
                        </div>

                        {cameraError && <div className="perm-box"><strong>📷 Camera needed</strong>{cameraError}</div>}

                        {!photos.before ? (
                            <>
                                <div className="video-wrap">
                                    <video ref={videoRef} autoPlay playsInline className="video" />
                                    <canvas ref={canvasRef} />
                                </div>
                                <button className="big-btn btn-orange" onClick={() => capturePhoto("before")} disabled={!stream || activeCamera !== "before"}>
                                    📸 Capture Before Photo
                                </button>
                            </>
                        ) : (
                            <div>
                                <div style={{position:"relative", marginBottom:"1rem"}}>
                                    <img src={photos.before.dataUrl} alt="before" style={{width:"100%", borderRadius:"12px", maxHeight:"280px", objectFit:"cover"}} />
                                    <span className="photo-slot-done-badge" style={{position:"absolute", top:"8px", right:"8px", background:"#2a9d8f", color:"#fff", fontSize:"0.7rem", fontWeight:"700", padding:"3px 8px", borderRadius:"20px"}}>✓ Captured</span>
                                    <button className="photo-slot-retake" style={{position:"absolute", bottom:"8px", right:"8px", background:"rgba(0,0,0,0.6)", color:"#fff", fontSize:"0.7rem", fontWeight:"600", padding:"4px 10px", borderRadius:"8px", border:"none", cursor:"pointer"}} onClick={() => retakePhoto("before")}>🔄 Retake</button>
                                </div>
                                <button className="big-btn btn-teal" onClick={() => { setStep("after"); openCamera("after"); }}>
                                    Next — After Photo ✅ →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── STEP: AFTER ── */}
                {step === "after" && (
                    <div>
                        <div className="info-card" style={{marginBottom:"1rem"}}>
                            <div style={{fontWeight:"700", color:"#333", marginBottom:"0.3rem"}}>✅ Step 3: After Drop-off</div>
                            <div style={{fontSize:"0.82rem", color:"#666"}}>Take a photo AFTER handing over materials — empty bags, kabari wala loading, or empty drop-off area.</div>
                        </div>

                        {cameraError && <div className="perm-box"><strong>📷 Camera needed</strong>{cameraError}</div>}

                        {!photos.after ? (
                            <>
                                <div className="video-wrap">
                                    <video ref={videoRef} autoPlay playsInline className="video" />
                                    <canvas ref={canvasRef} />
                                </div>
                                <button className="big-btn btn-orange" onClick={() => capturePhoto("after")} disabled={!stream || activeCamera !== "after"}>
                                    📸 Capture After Photo
                                </button>
                            </>
                        ) : (
                            <div>
                                <div style={{position:"relative", marginBottom:"1rem"}}>
                                    <img src={photos.after.dataUrl} alt="after" style={{width:"100%", borderRadius:"12px", maxHeight:"280px", objectFit:"cover"}} />
                                    <span style={{position:"absolute", top:"8px", right:"8px", background:"#2a9d8f", color:"#fff", fontSize:"0.7rem", fontWeight:"700", padding:"3px 8px", borderRadius:"20px"}}>✓ Captured</span>
                                    <button style={{position:"absolute", bottom:"8px", right:"8px", background:"rgba(0,0,0,0.6)", color:"#fff", fontSize:"0.7rem", fontWeight:"600", padding:"4px 10px", borderRadius:"8px", border:"none", cursor:"pointer"}} onClick={() => retakePhoto("after")}>🔄 Retake</button>
                                </div>
                                <button className="big-btn btn-teal" onClick={() => setStep("review")}>
                                    Review & Submit 🔍 →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── STEP: REVIEW ── */}
                {step === "review" && (
                    <div>
                        <div style={{fontWeight:"800", color:"var(--primary-blue)", marginBottom:"1.25rem", fontSize:"1.1rem", borderBottom:"1px solid #e5e7eb", paddingBottom:"0.75rem"}}>
                            🔍 Review Your Submission
                        </div>

                        <div className="review-grid">
                            <div className="review-photo">
                                <img src={photos.scale?.dataUrl} alt="scale" />
                                <div className="review-photo-label">⚖️ Scale</div>
                            </div>
                            <div className="review-photo">
                                <img src={photos.before?.dataUrl} alt="before" />
                                <div className="review-photo-label">📦 Before</div>
                            </div>
                            <div className="review-photo">
                                <img src={photos.after?.dataUrl} alt="after" />
                                <div className="review-photo-label">✅ After</div>
                            </div>
                        </div>

                        <div className="info-card" style={{marginBottom:"1.25rem"}}>
                            <div style={{fontWeight:"700", color:"#2a9d8f", marginBottom:"0.875rem", fontSize:"0.9rem", textTransform:"uppercase", letterSpacing:"0.04em"}}>📊 Summary</div>
                            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.65rem", fontSize:"0.875rem", color:"#444"}}>
                                <div>♻️ Declared weight: <strong>{declaredKg} kg</strong></div>
                                <div>📸 Photos: <strong style={{color:"#2a9d8f"}}>3 / 3 ✓</strong></div>
                                <div>📍 Location: <strong style={{color: location.lat ? "#1a7a4a" : "#f4a261"}}>{location.lat ? "Captured ✓" : "Not captured"}</strong></div>
                                <div>🕐 Time: <strong>{new Date().toLocaleTimeString()}</strong></div>
                            </div>
                        </div>

                        {!allPhotosDone && (
                            <div className="error" style={{marginBottom:"1rem"}}>Some photos are missing. Please go back and capture all photos.</div>
                        )}

                        {message && <div className="success" style={{marginBottom:"1rem"}}>{message}</div>}

                        <button className="big-btn btn-teal" onClick={handleSubmit} disabled={!allPhotosDone || step === "submitting"}>
                            {step === "submitting" ? "Submitting..." : "✅ Submit Recycling Proof →"}
                        </button>
                        <button className="big-btn" style={{background:"#f0f4f3", color:"#666"}} onClick={() => setStep("scale")}>
                            ← Go Back &amp; Retake
                        </button>
                    </div>
                )}

                {/* ── STEP: DONE ── */}
                {step === "done" && (
                    <div className="done-box">
                        <span className="done-icon">♻️</span>
                        <h2>Recycling Verified!</h2>
                        <p>Your recycling proof has been submitted with {declaredKg} kg of materials.<br />
                            An admin will review your photos and approve your points.<br /><br />
                            <strong style={{color:"#2a9d8f"}}>Great job helping the environment! 🌍</strong></p>
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