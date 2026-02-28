import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function StartProof() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const locationState = useLocation();
  const [activityId, setActivityId] = useState("");
  const [proofId, setProofId] = useState("");
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const startSession = async (id) => {
    setError(""); setMessage("");
    try {
      const res = await api.post(`/api/proof/start?activityId=${id}`);
      const data = res?.data?.data || res?.data;
      const receivedProofId = data?.id || data?.proofId || "";
      if (!receivedProofId) throw new Error("Proof session ID not found");
      setProofId(receivedProofId);
      sessionStorage.setItem("proofSession", JSON.stringify({ activityId: id, proofId: receivedProofId }));
      setMessage("Verification started");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed");
    }
  };

  const openCamera = async () => {
    setCameraError("");
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(media);
      if (videoRef.current) videoRef.current.srcObject = media;
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera access denied. Please allow camera permission in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Unable to access camera: " + err.message);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      setCameraError("Camera not ready yet. Please wait.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Timestamp
    const now = new Date();
    const timestamp = now.toLocaleString("en-US", {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });

    const fontSize = Math.max(16, canvas.width / 35);
    const smallFontSize = Math.max(12, canvas.width / 50);
    const barHeight = fontSize + smallFontSize + 24;

    // Dark bar at bottom
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

    // Timestamp text
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillText(`🕐 ${timestamp}`, 12, canvas.height - smallFontSize - 10);

    // GPS coords
    if (location.lat && location.lon) {
      ctx.font = `${smallFontSize}px monospace`;
      ctx.fillStyle = "rgba(100, 255, 200, 0.95)";
      ctx.fillText(`📍 ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`, 12, canvas.height - 8);
    } else {
      ctx.font = `${smallFontSize}px monospace`;
      ctx.fillStyle = "rgba(255, 200, 100, 0.9)";
      ctx.fillText("📍 Location not available", 12, canvas.height - 8);
    }

    // CCTRS watermark top right
    ctx.font = `bold ${smallFontSize}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "right";
    ctx.fillText("CCTRS", canvas.width - 10, 24);
    ctx.textAlign = "left";

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const file = dataUrlToFile(dataUrl, `proof_${Date.now()}.jpg`);
    setPhotos(prev => [...prev, { dataUrl, file, timestamp, lat: location.lat, lon: location.lon }]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getLocation = () => {
    setLocationError(""); setLocationLoading(true);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationLoading(false);
        },
        (err) => {
          setLocationLoading(false);
          if (err.code === 1) setLocationError("Location access denied. Please allow location in browser settings.");
          else if (err.code === 2) setLocationError("Location unavailable. Please try again.");
          else if (err.code === 3) setLocationError("Location timed out. Please try again.");
          else setLocationError("Unable to get location.");
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const submitProof = async () => {
    setError(""); setMessage("");
    if (!proofId || photos.length === 0 || !location.lat || !location.lon) {
      setError("Please capture at least one photo and allow location access before submitting.");
      return;
    }
    try {
      // The backend stores a single proof_image per activity and transitions the
      // status from DECLARED → PROOF_SUBMITTED in one atomic update.
      // Sending more than one request for the same activityId would cause a
      // "Activity is not in DECLARED state" error on the second call because
      // the status is already PROOF_SUBMITTED after the first request.
      // We therefore send exactly one API call using the first captured photo.
      setMessage("Uploading proof...");
      const formData = new FormData();
      formData.append("proofImageFile", photos[0].file);
      formData.append("latitude", String(location.lat));
      formData.append("longitude", String(location.lon));
      formData.append("proofTime", new Date().toISOString().replace("Z", ""));
      await api.post(`/api/activities/${activityId}/proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage("✅ Proof submitted successfully! Redirecting...");
      sessionStorage.removeItem("proofSession");
      setTimeout(() => navigate("/my-activities"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit proof");
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("proofSession");
    const parsed = stored ? JSON.parse(stored) : null;
    const state = locationState?.state || {};
    const id = state.activityId || parsed?.activityId || "";
    const pid = state.proofId || parsed?.proofId || "";
    if (!id) { setError("Start a new activity to begin proof."); return; }
    setActivityId(id);
    if (pid) setProofId(pid);
    else startSession(id);
    openCamera();
    getLocation();
  }, []);

  return (
      <div className="page">
        <style>{`
        .permission-box {
          background: #fffbea; border: 1px solid #f0c040;
          border-radius: 12px; padding: 1rem 1.2rem;
          margin-bottom: 1rem; font-size: 0.875rem; color: #7a5c00;
        }
        .permission-box strong { display: block; margin-bottom: 0.3rem; }
        .permission-steps { margin: 0.5rem 0 0 1rem; line-height: 1.8; }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        .photo-thumb {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: #f0f0f0;
          border: 2px solid #e2eeec;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .photo-thumb img {
          width: 100%; height: 100px; object-fit: cover; display: block;
        }
        .photo-thumb-remove {
          position: absolute; top: 5px; right: 5px;
          background: rgba(220,50,50,0.85); color: #fff;
          border: none; border-radius: 50%;
          width: 24px; height: 24px;
          font-size: 0.75rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; transition: background 0.2s;
        }
        .photo-thumb-remove:hover { background: rgba(200,30,30,1); }
        .photo-thumb-number {
          position: absolute; top: 5px; left: 6px;
          background: rgba(42,157,143,0.85); color: #fff;
          font-size: 0.68rem; font-weight: 700;
          padding: 1px 6px; border-radius: 4px;
        }
        .photo-thumb-info {
          background: rgba(0,0,0,0.7);
          color: #fff; font-size: 0.6rem;
          padding: 3px 5px; line-height: 1.5;
        }
        .photo-count-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: #e8faf7; color: #2a9d8f;
          font-size: 0.8rem; font-weight: 700;
          padding: 0.3rem 0.75rem; border-radius: 20px;
          border: 1px solid #b2e8e0;
        }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .dot-green { background: #2a9d8f; }
        .dot-orange { background: #f4a261; }
        .dot-red { background: #e63946; }
      `}</style>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-kicker">Step 2</div>
              <h1>Verify Your Activity</h1>
            </div>
            <div className="card-hint">Capture one or more photos with timestamps to verify your activity.</div>
          </div>

          {error && (
              <div className="error">
                {error} {activityId ? "" : <Link to="/submit-activity">Submit activity</Link>}
              </div>
          )}

          {locationError && (
              <div className="permission-box">
                <strong>📍 Location Access Needed</strong>
                {locationError}
                <ol className="permission-steps">
                  <li>Click the <strong>lock icon 🔒</strong> in your browser address bar</li>
                  <li>Find <strong>Location</strong> and set it to <strong>Allow</strong></li>
                  <li>Click <strong>Refresh GPS</strong> below</li>
                </ol>
              </div>
          )}

          {cameraError && (
              <div className="permission-box">
                <strong>📷 Camera Access Needed</strong>
                {cameraError}
                <ol className="permission-steps">
                  <li>Click the <strong>lock icon 🔒</strong> in your browser address bar</li>
                  <li>Find <strong>Camera</strong> and set it to <strong>Allow</strong></li>
                  <li>Click <strong>Reopen Camera</strong> below</li>
                </ol>
              </div>
          )}

          <div className="proof-grid">
            <div className="proof-panel">

              {/* STATUS */}
              <div className="proof-status">
                <div className="status-item">
                  <span>Verification</span>
                  <strong>
                    <span className={`status-dot ${proofId ? "dot-green" : "dot-orange"}`}></span>
                    {proofId ? "In progress" : "Starting..."}
                  </strong>
                </div>
                <div className="status-item">
                  <span>Location</span>
                  <strong>
                    <span className={`status-dot ${location.lat ? "dot-green" : locationError ? "dot-red" : "dot-orange"}`}></span>
                    {location.lat
                        ? `✓ ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
                        : locationLoading ? "Getting..." : locationError ? "Denied" : "Waiting..."}
                  </strong>
                </div>
                <div className="status-item">
                  <span>Photos</span>
                  <strong>
                    <span className={`status-dot ${photos.length > 0 ? "dot-green" : "dot-orange"}`}></span>
                    {photos.length > 0 ? `${photos.length} captured` : "None yet"}
                  </strong>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="row" style={{flexWrap:"wrap", gap:"0.5rem", marginTop:"1rem"}}>
                <button className="btn" onClick={openCamera}>📷 Reopen Camera</button>
                <button className="btn" onClick={capturePhoto} disabled={!stream}>📸 Capture Photo</button>
                <button className="btn" onClick={getLocation} disabled={locationLoading}>
                  {locationLoading ? "Getting GPS..." : "📍 Refresh GPS"}
                </button>
              </div>

              {/* PHOTOS GRID */}
              {photos.length > 0 && (
                  <div style={{marginTop:"1.2rem"}}>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.5rem"}}>
                  <span style={{fontSize:"0.875rem", fontWeight:"700", color:"#333"}}>
                    Captured Photos
                  </span>
                      <span className="photo-count-badge">
                    📷 {photos.length} photo{photos.length > 1 ? "s" : ""}
                  </span>
                    </div>
                    <div className="photos-grid">
                      {photos.map((photo, index) => (
                          <div key={index} className="photo-thumb">
                            <img src={photo.dataUrl} alt={`proof ${index + 1}`} />
                            <button className="photo-thumb-remove" onClick={() => removePhoto(index)}>✕</button>
                            <span className="photo-thumb-number">#{index + 1}</span>
                            <div className="photo-thumb-info">
                              <div>🕐 {photo.timestamp}</div>
                              {photo.lat && (
                                  <div style={{color:"rgba(100,255,180,0.9)"}}>
                                    📍 {photo.lat.toFixed(4)}, {photo.lon.toFixed(4)}
                                  </div>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                    <div style={{marginTop:"0.4rem", fontSize:"0.75rem", color:"#aaa"}}>
                      Tap ✕ to remove a photo
                    </div>
                  </div>
              )}

              {message && (
                  <div className="success" style={{marginTop:"1rem"}}>{message}</div>
              )}

              <div style={{display:"flex", gap:"0.75rem", marginTop:"1rem", flexWrap:"wrap"}}>
                <button
                    className="btn"
                    onClick={() => navigate(-1)}
                    style={{flex:"0 0 auto"}}
                >
                  ← Back
                </button>
                <button
                    className="primary-btn"
                    onClick={submitProof}
                    style={{flex:"1 1 auto"}}
                    disabled={!proofId || photos.length === 0 || !location.lat || !location.lon}
                >
                  {photos.length > 0
                      ? `Submit Photo →`
                      : "Submit Verification"}
                </button>
              </div>
            </div>

            {/* CAMERA PREVIEW */}
            <div className="proof-preview">
              {!cameraError ? (
                  <video ref={videoRef} autoPlay playsInline className="video" />
              ) : (
                  <div style={{
                    width:"100%", height:"260px", background:"#1a1a1a",
                    borderRadius:"12px", display:"flex", alignItems:"center",
                    justifyContent:"center", flexDirection:"column", gap:"0.5rem", color:"#fff"
                  }}>
                    <span style={{fontSize:"3rem"}}>📷</span>
                    <span style={{fontSize:"0.85rem", opacity:0.7}}>Camera access denied</span>
                    <button className="btn" onClick={openCamera} style={{marginTop:"0.5rem"}}>Try Again</button>
                  </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        </div>
      </div>
  );
}

function dataUrlToFile(dataUrl, filename) {
  const [header, data] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], filename, { type: mime });
}