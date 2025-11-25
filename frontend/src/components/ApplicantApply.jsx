import { useState } from "react";

const API = "http://127.0.0.1:5000/api";

export default function ApplicantApply({ jobId }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please upload a CV");

    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("user_id");

    if (!token || !name || !email || !userId)
      return alert("You must login first!");

    const formData = new FormData();
    formData.append("job_id", jobId);
    formData.append("cv", file);

    // SEND USER INFO TO BACKEND
    formData.append("applicant_name", name);
    formData.append("applicant_email", email);
    formData.append("applicant_id", userId);

    const res = await fetch(`${API}/applications/submit`, {
      method: "POST",
      headers: { Authorization: token },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    setMessage("Application submitted successfully!");
  };

  return (
    <div className="bg-white/80 p-8 rounded-2xl shadow-xl max-w-xl">
      <h2 className="text-2xl font-bold text-[#0d6832] mb-4">
        Upload Your CV
      </h2>

      <label className="block border-2 border-dashed border-[#0d6832]/40 p-8 rounded-xl cursor-pointer bg-[#e6f4ec]/40 hover:bg-[#e6f4ec]/70 transition">
        <span className="text-[#0d6832] font-semibold">Click to choose your CV</span>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
      </label>

      {file && (
        <p className="mt-3 text-sm font-medium text-slate-700">
          Selected: <span className="font-semibold">{file.name}</span>
        </p>
      )}

      <button
        onClick={handleUpload}
        className="mt-5 bg-[#0d6832] text-white px-6 py-3 rounded-xl">
        Submit Application
      </button>

      {message && <p className="mt-4 text-green-700 font-semibold">{message}</p>}
    </div>
  );
}
