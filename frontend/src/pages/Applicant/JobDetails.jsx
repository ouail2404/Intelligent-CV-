import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`${API}/job/${id}`);
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);


  const pickFile = () =>
    new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.docx,.txt";
      input.onchange = (e) => resolve(e.target.files[0]);
      input.click();
    });

  /** Check Match */
  const checkMatch = async () => {
    const file = await pickFile();
    if (!file) return;

    setUploading(true);

    try {
      const form = new FormData();
      form.append("job_id", id);
      form.append("cv", file);

      const res = await fetch(`${API}/match_single`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("match_result", JSON.stringify(data.match_result));
      navigate(`/applicant/match/${id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  
  const submitApplication = async () => {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    const file = await pickFile();
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    setUploading(true);

    try {
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
      if (!res.ok) throw new Error(data.error);

      alert("🎉 Application submitted!");

      
      navigate("/applicant");

    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-lg animate-pulse">
        Loading job details...
      </div>
    );

  if (!job)
    return <div className="text-red-600 text-center py-10">Job not found.</div>;

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-md max-w-3xl mx-auto mt-6">

     
      <button
        onClick={() => navigate("/applicant")}
        className="text-white  transition flex items-center gap-2 mb-5 hover:-translate-y-1 duration-500"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-extrabold text-[#0d6832]">{job.title}</h1>

      <p className="mt-4 text-slate-700 leading-relaxed whitespace-pre-line">
        {job.description}
      </p>

      <div className="flex gap-4 mt-8">
        <button
          onClick={checkMatch}
          disabled={uploading}
          className={`px-5 py-3 rounded-lg text-white shadow-sm transition ${
            uploading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Processing..." : "Check Fit"}
        </button>

        <button
          onClick={submitApplication}
          disabled={uploading}
          className={`px-5 py-3 rounded-lg text-white shadow-sm transition ${
            uploading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {uploading ? "Uploading..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
