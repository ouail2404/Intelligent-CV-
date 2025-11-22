import React, { useState } from "react";
const API = "http://127.0.0.1:5000/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Invalid login");
      return;
    }

    // Save token
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    onLogin(data.role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-emerald-700 mb-6">Login</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-3"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-3"
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-emerald-700 text-white p-3 rounded mt-2"
        >
          Login
        </button>

        <p className="mt-4 text-sm text-slate-600 text-center">
          Don’t have an account?{" "}
          <a href="/signup" className="text-emerald-700 underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
