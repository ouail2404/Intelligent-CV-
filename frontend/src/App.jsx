import React, { useState, useEffect } from "react";
import auilogo from "./assets/aui_logo.png";

const API_BASE = "http://127.0.0.1:5000";

export default function App() {
  const [activeTab, setActiveTab] = useState("post"); // "post" | "select"
  const [jd, setJd] = useState("");
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobList, setJobList] = useState([]);
  const [hasAttempted, setHasAttempted] = useState(false);

  // NEW: Applicants
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [rankedResults, setRankedResults] = useState([]);
const [loadingRanking, setLoadingRanking] = useState(false);


  // Load jobs
  useEffect(() => {
    refreshJobs();
  }, []);

  const refreshJobs = async () => {
    const res = await fetch(`${API_BASE}/api/jobs/list`);
    const data = await res.json();
    setJobList(data);
  };

  // ----------------------------------------------------
  // CREATE JOB
  // ----------------------------------------------------
  const handleCreateJob = async () => {
    if (!title.trim() || !jd.trim()) {
      alert("Please fill job title + description.");
      return;
    }

    const res = await fetch(`${API_BASE}/api/jobs/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: jd }),
    });

    if (res.ok) {
      alert("Job posted successfully!");
      setTitle("");
      setJd("");
      refreshJobs();
    } else {
      alert("Error posting job.");
    }
  };

  // ----------------------------------------------------
  // FILE UPLOAD
  // ----------------------------------------------------
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError("");
  };

  // ----------------------------------------------------
  // MATCHING
  // ----------------------------------------------------
  const handleMatch = async () => {
    setHasAttempted(true);
    setError("");
    setResults([]);
    setOpenId(null);

    if (!jd.trim()) {
      setError("Please paste or load the Job Description.");
      return;
    }

    if (!files.length) {
      setError("Please upload at least one CV file.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("job_description", jd);
      files.forEach((file) => formData.append("files", file));

      const res = await fetch(`${API_BASE}/api/match_files`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Matching failed.");
        return;
      }

      setResults(data.results || []);
    } catch (err) {
      setError("Backend unreachable.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const navBtn = (tab, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        activeTab === tab
          ? "bg-emerald-700 text-white shadow"
          : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50"
      }`}
    >
      {label}
    </button>
  );

  // ----------------------------------------------------
  // LOAD APPLICANTS FOR SELECTED JOB
  // ----------------------------------------------------
  const loadApplicants = async (jobId) => {
  if (!jobId) return;

  try {
    setLoadingApplicants(true);
    const res = await fetch(`${API_BASE}/api/applications/job/${jobId}`);
    const data = await res.json();
    setApplicants(data.applicants || []);
  } catch (err) {
    console.error("Error loading applicants:", err);
  } finally {
    setLoadingApplicants(false);
  }
};


const runMatchingForApplicants = async () => {
  if (!selectedJobId) return;

  try {
    setLoadingRanking(true);
    setRankedResults([]);

    const res = await fetch(`${API_BASE}/api/applications/match/${selectedJobId}`);
    const data = await res.json();

    if (data.results) {
      setRankedResults(data.results);
    }
  } catch (err) {
    console.error("Error matching applicants:", err);
  } finally {
    setLoadingRanking(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="w-full bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-800">
            Intelligent CV Screening System – HR Admin
          </h1>
          <img src={auilogo} className="h-12" />
        </div>
      </header>

      {/* NAVIGATION */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex gap-4">
        {navBtn("post", "Post Job")}
        {navBtn("select", "Select Job")}
      </div>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 pb-16 space-y-10">

        {/* POST JOB */}
        {activeTab === "post" && (
          <section className="bg-white p-6 rounded-xl shadow border">
            <h2 className="text-xl font-semibold mb-4 text-emerald-700">
              Post New Job
            </h2>

            <label className="text-sm font-medium">Job Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 mb-4"
              placeholder="e.g. Frontend Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="text-sm font-medium">Job Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 mt-1 h-48"
              placeholder="Paste the job description…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />

            <button
              onClick={handleCreateJob}
              className="mt-4 px-6 py-2 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800"
            >
              Post Job
            </button>
          </section>
        )}

        {/* SELECT JOB TAB */}
        {activeTab === "select" && (
          <>
            {/* SELECT JOB DROPDOWN */}
            <section className="bg-white p-6 rounded-xl shadow border">
              <h2 className="text-lg font-semibold text-emerald-700 mb-3">
                Select Job
              </h2>

              <select
                onChange={async (e) => {
                  const id = e.target.value;
                  setSelectedJobId(id);
                  setApplicants([]);
                  if (!id) return;

                  // Load JD
                  const res = await fetch(`${API_BASE}/api/job/${id}`);
                  const data = await res.json();
                  if (data.description) setJd(data.description);

                  // Load applicants
                  loadApplicants(id);
                }}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="">-- Select Job --</option>
                {jobList.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </section>
<button
  className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-semibold mb-4"
  onClick={runMatchingForApplicants}
>
  {loadingRanking ? "Ranking..." : "Run Matching for All Applicants"}
</button>

            {/* VIEW APPLICANTS */}
            {selectedJobId && (
              <section className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-lg font-semibold text-emerald-700 mb-3">
                  Applicants for This Job
                </h2>

                {loadingApplicants ? (
                  <p>Loading applicants...</p>
                ) : applicants.length === 0 ? (
                  <p className="text-slate-500">No applicants yet.</p>
                ) : (
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-slate-100 text-left">
                        <th className="p-2 border">Filename</th>
                        <th className="p-2 border">Submitted At</th>
                        <th className="p-2 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((app) => (
                        <tr key={app._id} className="border">
                          <td className="p-2 border">{app.filename}</td>
                          <td className="p-2 border">
                            {new Date(app.submitted_at).toLocaleString()}
                          </td>
                          <td className="p-2 border space-x-3">
                            <a
                              className="text-emerald-700 font-semibold underline"
                              href={`${API_BASE}/uploads/${app.filename}`}

                              download
                            >
                              Download
                            </a>

                            
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )}
{/* RANKING RESULTS — SORTED LIST */}
{rankedResults.length > 0 && (
  <section className="bg-white p-6 rounded-xl shadow border">
    <h2 className="font-semibold text-lg mb-4">Results</h2>

    {rankedResults.map((r, index) => {
      const isOpen = openId === r.id;

      return (
        <div
          key={r.id}
          className="mb-4 rounded-xl bg-emerald-700 text-white p-4 cursor-pointer"
          onClick={() => toggleRow(r.id)}
        >
          {/* TOP ROW */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>

              <div>
                <p className="text-lg font-semibold">{r.name}</p>
                <p className="text-sm opacity-80">
                  {r.fit} — {r.years} years exp.
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="text-xl font-bold">{r.score}%</p>
              <p className="text-[10px] opacity-80 -mt-1">match score</p>
            </div>
          </div>

          {/* EXPANDED CONTENT */}
          {isOpen && (
            <div className="bg-white text-slate-900 mt-4 p-4 rounded-lg space-y-4">
              {/* Matched */}
              <div>
                <p className="font-semibold text-emerald-700">Matched Skills</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {r.matched_skills?.map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing MUST */}
              <div>
                <p className="font-semibold text-red-600">Missing MUST Skills</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {r.missing_must?.map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extra skills */}
              <div>
                <p className="font-semibold text-slate-700">Extra Skills</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {r.extra_skills?.map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-slate-200 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    })}
  </section>
)}

            {/* MATCHING UI */}
            <section className="bg-white p-6 rounded-xl shadow border">
              <h2 className="text-lg font-semibold mb-3">
                Job Description & Candidate CVs
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* JD */}
                <div>
                  <label className="text-sm font-medium">Job Description</label>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    className="w-full mt-2 h-64 border rounded-lg p-3 text-sm"
                  />
                </div>

                {/* FILE UPLOAD */}
                <div>
                  <label className="text-sm font-medium">Candidate CVs</label>

                  <label className="mt-2 block border-2 border-dashed border-emerald-400 rounded-xl p-6 text-center cursor-pointer bg-emerald-50 hover:bg-emerald-100">
                    <p className="font-semibold text-emerald-700">
                      Click to upload CVs
                    </p>
                    <input
                      multiple
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleMatch}
                    disabled={loading}
                    className="mt-4 px-5 py-2 bg-emerald-700 text-white rounded-full font-semibold hover:bg-emerald-800"
                  >
                    {loading ? "Running..." : "Run Matching"}
                  </button>
                </div>
              </div>
            </section>

            {/* RESULTS */}
            {hasAttempted && (
              <section className="bg-white p-6 rounded-xl shadow border">
                <h2 className="font-semibold mb-3">Results</h2>

                {results.map((r, index) => {
                  const isOpen = openId === r.id;
                  return (
                    <div key={r.id} className="border-b py-3">
                      <button
                        className="w-full flex justify-between items-center text-left"
                        onClick={() => toggleRow(r.id)}
                      >
                        <div className="flex gap-3 items-center">
                          <div className="w-7 h-7 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-full text-xs font-bold">
                            {index + 1}
                          </div>

                          <div>
                            <p className="font-semibold">{r.name}</p>
                            <p className="text-xs text-slate-500">
                              {r.fit} — {r.years} years exp.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-emerald-700">
                              {r.score}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              match score
                            </span>
                          </div>

                          <div className="text-emerald-600 text-xl font-bold">
                            {isOpen ? "−" : "+"}
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="ml-10 mt-3 space-y-3 text-sm">
                          {/* Matched */}
                          <div>
                            <p className="font-semibold text-emerald-700">
                              Matched Skills
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {r.matched_skills?.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Missing MUST */}
                          <div>
                            <p className="font-semibold text-red-600">
                              Missing MUST Skills
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {r.missing_must?.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Extra */}
                          <div>
                            <p className="font-semibold text-slate-700">
                              Extra Skills
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {r.extra_skills?.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-slate-200 rounded-full text-xs"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
