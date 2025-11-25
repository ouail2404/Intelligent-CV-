import { Link } from "react-router-dom";
import { useEffect, useState } from "react";


const API = "http://127.0.0.1:5000/api";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");


  const userEmail = localStorage.getItem("email");   // ✅ IMPORTANT

  // -------------------- FETCH JOBS --------------------
  useEffect(() => {
    fetch(`${API}/jobs/list`)
      .then((res) => res.json())
      .then((data) => setJobs(data.filter((j) => j.title)));
  }, []);

  // -------------------- FETCH SAVED JOBS --------------------
  useEffect(() => {
    if (!userEmail) return;

    fetch(`${API}/saved/${userEmail}`)
      .then((res) => res.json())
      .then((data) => setSavedJobs(data.savedIds || []));
  }, [userEmail]);

  // -------------------- SEARCH FILTER --------------------
  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------- SAVE / UNSAVE --------------------
  function toggleSave(job) {
    const isSaved = savedJobs.includes(job._id);

    if (!isSaved) {
      // SAVE JOB
      fetch(`${API}/saved/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job._id,
          user_email: userEmail,
        }),
      });

      setSavedJobs([...savedJobs, job._id]);
    } else {
      // UNSAVE JOB
      fetch(`${API}/saved/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job._id,
          user_email: userEmail,
        }),
      });

      setSavedJobs(savedJobs.filter((id) => id !== job._id));
    }
  }

  // -------------------- UI --------------------
  return (
    <div className="px-4">
      {/* TITLE */}
      <h1 className="text-4xl font-extrabold text-[#0d6832] text-center mb-3">
        Available Positions
      </h1>

      <p className="text-center text-slate-600 mb-10">
        Discover exciting career opportunities tailored to your skills.
      </p>

      {/* SEARCH BAR */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search positions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/2 px-4 py-3 border rounded-xl shadow-sm text-sm"
        />
      </div>

      <p className="text-right text-slate-500 mb-6 text-sm">
        {jobs.length} positions available
      </p>

      {/* JOB GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((job) => (
          <div
            key={job._id}
            className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg transition"
          >
            {/* TOP ROW */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs">
                Full-time
              </span>

              
            </div>

            {/* TITLE */}
            <h2 className="text-xl font-bold text-[#0d6832]">{job.title}</h2>

            {/* DESCRIPTION */}
            <p className="text-slate-600 text-sm mt-2 line-clamp-3">
              {job.description.slice(0, 150)}...
            </p>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 mt-4">
              {job.description
                .split(" ")
                .filter((word) => word.length < 15 && /[a-zA-Z]/.test(word))
                .slice(0, 3)
                .map((tag, i) => (
                  <span
                    key={i}
                    className="bg-[#e6f4ec] text-[#0d6832] px-3 py-1 text-xs rounded-full"
                  >
                    {tag.replace(/[^a-zA-Z]/g, "")}
                  </span>
                ))}
            </div>

            {/* VIEW BUTTON */}
            <Link
              to={`job/${job._id}`}
              className="block w-full text-center mt-6 bg-[#0d6832] text-white py-2.5 rounded-xl font-semibold hover:bg-[#094d26] transition"
            >
              View Position
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
