import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/job/${id}`)
      .then(res => res.json())
      .then(data => setJob(data));
  }, [id]);

  // ---------------------------------------
  // 1️⃣ CHECK MATCH / FIT
  // ---------------------------------------
  const checkMatch = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.txt";

    input.onchange = async e => {
      const file = e.target.files[0];
      const form = new FormData();

      form.append("job_id", id);
      form.append("cv", file);

      const res = await fetch(`${API}/match_single`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) return alert(data.error);

      // Save match result locally
      localStorage.setItem("match_result", JSON.stringify(data.match_result));

      // Navigate to match results page
      navigate(`/applicant/match/${id}`);
    };

    input.click();
  };

  // ---------------------------------------
  // 2️⃣ SUBMIT FINAL APPLICATION
  // ---------------------------------------
  const submitApplication = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.txt";

    input.onchange = async e => {
      const file = e.target.files[0];
      const form = new FormData();

      form.append("job_id", id);
      form.append("cv", file);

      // Optional – if you have auth:
      form.append("applicant_name", "Anonymous User");
      form.append("applicant_email", "no-email@unknown.com");

      const res = await fetch(`${API}/applications/submit`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) return alert(data.error);

      alert("🎉 Your application was submitted successfully!");
    };

    input.click();
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="bg-white p-10 border border-gray-200 rounded-xl shadow-sm">
      <h1 className="text-2xl font-semibold text-[#0d6832]">
        {job.title}
      </h1>

      <p className="mt-4 text-slate-700 text-sm leading-relaxed">
        {job.description}
      </p>

      <div className="flex gap-4 mt-8">

        {/* 1️⃣ CHECK MATCH BUTTON */}
        <button
          onClick={checkMatch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition shadow-sm"
        >
          Check Fit / Match CV
        </button>

        {/* 2️⃣ SUBMIT APPLICATION BUTTON */}
        <button
          onClick={submitApplication}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold transition shadow-sm"
        >
          Submit Application
        </button>

      </div>
    </div>
  );
}
