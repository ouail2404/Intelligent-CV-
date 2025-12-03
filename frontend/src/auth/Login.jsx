import React, { useState } from "react";
import { motion } from "framer-motion";
import aui_logo from "../assets/aui_logo.png";
import bgVideo from "../assets/aui_video.mp4";

const API = "http://127.0.0.1:5000/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const VIDEO_START = 19; 
  const VIDEO_END_OFFSET = 7; 

  // LOGIN 
  const handleLogin = async () => {
    setError("");

    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Invalid login");
      return;
    }

   localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);
localStorage.setItem("name", data.name);
localStorage.setItem("email", data.email);
localStorage.setItem("user_id", data.user_id);

    onLogin(data.role);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* VIDEO BACKGROUND WITH TRIMMED RANGE */}
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedMetadata={(e) => {
          const video = e.target;
          const duration = video.duration;
          video.currentTime = VIDEO_START;

          
          video.addEventListener("timeupdate", () => {
            if (video.currentTime >= duration - VIDEO_END_OFFSET) {
              video.currentTime = VIDEO_START;
            }
          });
        }}
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      
      <div className="absolute inset-0 bg-black/5 " />

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 bg-white backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md"
      >
        {/* AUI Logo */}
        <div className="flex justify-center mb-6">
          <img src={aui_logo} alt="AUI" className="h-20 opacity-95" />
        </div>

        <h2 className="text-3xl font-bold text-center text-emerald-800 mb-2 drop-shadow-sm">
          Sign in with Email
        </h2>

        <p className="text-center text-gray-700 mb-6">
          Welcome to the Intelligent CV Screening System
        </p>

        {error && (
          <p className="text-red-500 mb-3 text-center font-medium">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl bg-white/80 focus:ring-2 focus:ring-emerald-600 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-xl bg-white/80 focus:ring-2 focus:ring-emerald-600 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-3 rounded-xl text-lg font-semibold transition shadow-lg"
          >
            Login
          </motion.button>
        </div>

        <p className="mt-4 text-sm text-gray-700 text-center">
          Don’t have an account?{" "}
          <a href="/signup" className="text-emerald-700 font-semibold underline">
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
