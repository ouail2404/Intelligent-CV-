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

      localStorage.setItem("match_result", JSON.stringify(data.match_result));
      navigate(`/applicant/match/${id}`);
    };

    input.click();
  };

  const submitApplication = () => {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.txt";

    input.onchange = async e => {
      const file = e.target.files[0];

      const form = new FormData();
      form.append("job_id", id);
      form.append("cv", file);

      form.append("applicant_name", name);
      form.append("applicant_email", email);
      form.append("applicant_id", userId);

      const res = await fetch(`${API}/applications/submit`, {
        method: "POST",
        headers: { Authorization: token },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error);

      alert("🎉 Application submitted!");
    };

    input.click();
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="bg-white p-10 border border-gray-200 rounded-xl shadow-sm">
      <h1 className="text-2xl font-semibold text-[#0d6832]">{job.title}</h1>

      <p className="mt-4 text-slate-700">{job.description}</p>

      <div className="flex gap-4 mt-8">
        <button
          onClick={checkMatch}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Check Fit
        </button>

        <button
          onClick={submitApplication}
          className="bg-green-700 text-white px-5 py-3 rounded-lg"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}
