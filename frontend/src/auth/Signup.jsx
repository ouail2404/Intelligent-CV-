import React, { useState, useRef, useEffect } from "react";
import aui_logo from "../assets/aui_logo.png";
import aui_video from "../assets/aui_video.mp4";

const API = "http://127.0.0.1:5000/api";

export default function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("applicant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const videoRef = useRef(null);

  // -------------------- VIDEO TRIMMING LOGIC --------------------
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // Start the video at 30 seconds
    const startAt = 31;
    const cutBeforeEnd = 7;

    vid.currentTime = startAt;

    const handleTimeUpdate = () => {
      if (vid.currentTime >= vid.duration - cutBeforeEnd) {
        vid.currentTime = startAt;
        vid.play();
      }
    };

    vid.addEventListener("timeupdate", handleTimeUpdate);

    return () => vid.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  // ---------------- SIGNUP LOGIC ----------------
  const handleSignup = async () => {
    setError("");

    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }

    onSignup();
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background video */}
      <video
        ref={videoRef}
        src={aui_video}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Slight dark overlay (much lighter than before) */}
      <div className="absolute inset-0 bg-black/20" />

      {/* SIGNUP CARD */}
      <div className="relative bg-white backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-sm border border-white/40">

        <div className="flex justify-center mb-4">
          <img src={aui_logo} alt="AUI" className="h-16 opacity-95" />
        </div>

        <h2 className="text-2xl font-bold text-center text-emerald-700 mb-1">
          Create Your Account
        </h2>

        <p className="text-center text-slate-600 mb-4 text-sm">
          Join the Intelligent CV Screening System
        </p>

        {error && (
          <p className="text-red-500 mb-3 text-center text-sm">{error}</p>
        )}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-xl bg-white/80 focus:ring-2 focus:ring-emerald-600 outline-none transition"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl bg-white/80 focus:ring-2 focus:ring-emerald-600 outline-none transition"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-xl bg-white/80 focus:ring-2 focus:ring-emerald-600 outline-none transition"
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="w-full p-3 border rounded-xl bg-white/80 focus:ring-2 focus:ring-emerald-600 outline-none transition"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="applicant">Applicant</option>
            <option value="hr">HR Admin</option>
          </select>

          <button
            onClick={handleSignup}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-3 rounded-xl text-lg font-semibold transition"
          >
            Create Account
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-800 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-700 font-semibold underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
