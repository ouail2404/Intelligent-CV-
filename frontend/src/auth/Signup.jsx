import React, { useState } from "react";
const API = "http://127.0.0.1:5000/api";

export default function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("applicant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }

    onSignup();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-emerald-700 mb-6">
          Create Account
        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 border rounded mb-3"
          onChange={e => setName(e.target.value)}
        />

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

        <label className="text-sm font-medium mb-1 block">Select Role</label>
        <select
          className="w-full p-3 border rounded mb-4"
          onChange={e => setRole(e.target.value)}
        >
          <option value="applicant">Applicant</option>
          <option value="hr">HR Admin</option>
        </select>

        <button
          onClick={handleSignup}
          className="w-full bg-emerald-700 text-white p-3 rounded mt-2"
        >
          Create Account
        </button>

        <p className="mt-4 text-sm text-slate-600 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-700 underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
