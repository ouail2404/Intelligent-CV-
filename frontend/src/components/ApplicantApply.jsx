import { useState } from "react";

const API = "http://127.0.0.1:5000/api";

export default function ApplicantApply() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please upload a CV");

    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch(`${API}/match_single`, {

      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setMessage("Application submitted! Check HR for ranking.");
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold text-[#0d6832] mb-3">
        Upload Your CV
      </h2>

      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 rounded"
      />

      <button
        onClick={handleUpload}
        className="block mt-4 bg-[#0d6832] text-white px-4 py-2 rounded"
      >
        Submit Application
      </button>

      {message && (
        <p className="mt-3 text-green-700 font-semibold">{message}</p>
      )}
    </div>
  );
}
