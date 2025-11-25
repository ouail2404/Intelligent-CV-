import {
  PlusIcon,
  BriefcaseIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import aui_logo from "./assets/aui_logo.png";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const API_BASE = "http://127.0.0.1:5000/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [jd, setJd] = useState("");
  const [title, setTitle] = useState("");
  const [jobList, setJobList] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [rankedResults, setRankedResults] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [editJobId, setEditJobId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");


  const username = String(localStorage.getItem("name") || "User")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const role =
    localStorage.getItem("role") === "hr" ? "HR Administrator" : "Applicant";

  useEffect(() => {
    refreshJobs();
    loadRecentApplicants();
  }, []);

  const refreshJobs = async () => {
    const res = await fetch(`${API_BASE}/jobs/list`);
    const data = await res.json();
    console.log("MATCH RESULTS:", data.match);

    setJobList(data);
  };

  const loadRecentApplicants = async () => {
    const res = await fetch(`${API_BASE}/applications/recent`).catch(() => null);
    if (!res || !res.ok) return;
    const data = await res.json();
    setRecentApplicants(data.recent || []);
  };

  const handleCreateJob = async () => {
    if (!title.trim() || !jd.trim())
      return alert("Fill job title + description.");

    const res = await fetch(`${API_BASE}/jobs/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: jd }),
    });

    if (res.ok) {
      alert("Job posted successfully!");
      setTitle("");
      setJd("");
      refreshJobs();
    }
  };

  const loadApplicants = async (jobId) => {
    setApplicants([]);
    if (!jobId) return;

    setLoadingApplicants(true);
    const res = await fetch(`${API_BASE}/applications/job/${jobId}`);
    const data = await res.json();
    setApplicants(data.applicants || []);
    setLoadingApplicants(false);
  };

const runMatchingForApplicants = async () => {
  if (!selectedJobId) return alert("Select a job first");

  setLoadingRanking(true);

  // GET the job description
  const jobRes = await fetch(`${API_BASE}/job/${selectedJobId}`);
  const jobData = await jobRes.json();

  // GET all applicants
  const appsRes = await fetch(`${API_BASE}/applications/job/${selectedJobId}`);
  const appsData = await appsRes.json();

  const cvs = appsData.applicants.map((a) => ({
  name: a.filename,
  text: a.cv_text || "",
  applicant_name: a.applicant_name,
  applicant_email: a.applicant_email
}));


  const res = await fetch(`${API_BASE}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_description: jobData.description,
      cvs: cvs
    }),
  });

  const data = await res.json();

  setRankedResults(data.results || []);
  setLoadingRanking(false);
};


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };
const handleDeleteJob = async (id) => {
  if (!window.confirm("Are you sure you want to delete this job?")) return;

  const res = await fetch(`${API_BASE}/jobs/delete/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    alert("Job deleted.");
    refreshJobs();
  } else {
    alert("Failed to delete job.");
  }
};

  return (
    <div className="min-h-screen flex bg-[#f5f7fa]">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r shadow-lg p-6 flex flex-col">
        <img src={aui_logo} alt="AUI" className="h-20 mx-auto mb-8 opacity-90" />
        <h2 className="text-2xl font-bold text-[#0b1f17] mb-8">Navigation</h2>
        

        <nav className="space-y-6">

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-lg font-medium transition ${
              activeTab === "dashboard" || activeTab === "post"
                ? "bg-[#0d6832] text-white shadow-md"
                : "bg-white border text-slate-700 hover:bg-[#e6f4ec]"
            }`}
          >
            <PlusIcon className="h-6 w-6" />
            Post Job
          </button>

          <button
            onClick={() => setActiveTab("select")}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-lg font-medium transition ${
              activeTab === "select"
                ? "bg-[#0d6832] text-white shadow-md"
                : "bg-white border text-slate-700 hover:bg-[#e6f4ec]"
            }`}
          >
            <BriefcaseIcon className="h-6 w-6" />
            Select Job
          </button>

          
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">

        {/* NAVBAR */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Al Akhawayn University
              </h1>
              <p className="text-sm text-slate-600 -mt-1">CV Screening System</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="h-10 w-10 text-gray-600" />
              <div className="text-right">
                <p className="font-semibold text-slate-900">{username}</p>
                <p className="text-xs text-slate-600 -mt-1">HR Admin</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 border px-5 py-2.5 rounded-xl shadow
       hover:bg-gray-800 hover:text-[black] hover:translate-x-2
       duration-500 transition-all"


            >
              <span className="font-medium text-white hover:text-black">Logout</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow">
                <h3 className="text-lg font-semibold">Active Jobs</h3>
                <p className="text-4xl font-bold text-[#0d6832]">
                  {jobList.length}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <h3 className="text-lg font-semibold">Recent Applicants</h3>
                <p className="text-4xl font-bold text-[#0d6832]">
                  {recentApplicants.length}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <h3 className="text-lg font-semibold">System Status</h3>
                <p className="text-xl font-bold text-[#0d6832]">Online</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
              <h2 className="text-xl font-bold mb-4">Post New Job</h2>
              <label className="font-medium text-sm">Job Title</label>
              <input
                className="w-full p-3 border rounded-xl mb-5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="font-medium text-sm">Job Description</label>
              <textarea
                className="w-full p-3 border rounded-xl h-40"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
              <button
                onClick={handleCreateJob}
                className="mt-5 px-6 py-3 bg-[#0d6832] text-white rounded-xl"
              >
                Post Job
              </button>
            </div>

            {/* Recent Applicants */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Recent Applicants</h2>
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr] font-semibold text-slate-600 text-sm pb-3 border-b">
                <div>Applicant</div>
                <div>Position</div>
                <div>Match</div>
                <div>Status</div>
              </div>

              <div className="mt-4 space-y-4">
                {recentApplicants.map((a) => (
                  <div key={a._id} className="grid grid-cols-[2fr,1fr,1fr,1fr] items-center py-4 border-b">
                    <div className="flex items-center gap-3">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      <div>
                        <p className="font-semibold text-slate-900 text-base">{a.applicant_name}</p>
                        <p className="text-xs text-slate-500">{a.applicant_email}</p>
                      </div>
                    </div>

                    <div className="text-slate-800 font-medium">{a.job_title}</div>

                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${a.match_score || 0}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold">
                        {(a.match_score || 0).toFixed(1)}%
                      </p>
                    </div>

                    <span
  className="px-2 py-0.5 bg-green-100 text-green-700 font-medium rounded-full text-sm w-fit"
>
  Reviewed
</span>


                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SELECT JOB */}
        {activeTab === "select" && (
          <>
            {/* Job selector */}
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
              <h2 className="text-xl font-bold mb-3">Select Job</h2>

              <select
                className="w-full p-3 border rounded-xl bg-white"
                onChange={async (e) => {
                  const id = e.target.value;
                  setSelectedJobId(id);
                  if (!id) return;

                  const res = await fetch(`${API_BASE}/job/${id}`);
                  const data = await res.json();
                  setJd(data.description || "");

                  loadApplicants(id);
                }}
              >
                <option value="">— Select Job —</option>
                {jobList.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
              {/* Show Edit/Delete ONLY for selected job */}
{selectedJobId && (
  <div className="bg-white p-6 rounded-xl border shadow-md mt-4">
    <h3 className="text-lg font-semibold text-[#0d6832]">
      Selected Job Details
    </h3>

    <p className="mt-2 text-sm text-gray-700">
      <strong>Title:</strong> {
        jobList.find((j) => j._id === selectedJobId)?.title
      }
    </p>

    <p className="mt-1 text-sm text-gray-700">
      <strong>Description:</strong><br />
      {
        jobList.find((j) => j._id === selectedJobId)?.description
      }
    </p>

    <div className="flex gap-3 mt-4">
      {/* Edit Button */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        onClick={() => {
          const job = jobList.find((j) => j._id === selectedJobId);
          setEditJobId(job._id);
          setEditTitle(job.title);
          setEditDesc(job.description);
          setEditPopup(true);
        }}
      >
        Edit
      </button>

      {/* Delete Button */}
      <button
        className="px-4 py-2  text-white rounded-lg"
        onClick={() => handleDeleteJob(selectedJobId)}
      >
        Delete
      </button>
    </div>
  </div>
)}



              <button
                onClick={runMatchingForApplicants}
                className="mt-4 px-5 py-2 bg-[#0d6832] text-white rounded-xl"
              >
                {loadingRanking ? "Ranking..." : "Run Ranking"}
              </button>
            </div>

            {/* Applicant list */}
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
              <h2 className="text-xl font-bold mb-4">Applicants</h2>

              {loadingApplicants ? (
                <p>Loading…</p>
              ) : applicants.length === 0 ? (
                <p>No applicants yet.</p>
              ) : (
                <table className="w-full border rounded-xl overflow-hidden">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-3 border">Name</th>
                      <th className="p-3 border">Email</th>
                      <th className="p-3 border">Submitted</th>
                      <th className="p-3 border">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app._id}>
                        <td className="p-3 border">{app.applicant_name}</td>
                        <td className="p-3 border">{app.applicant_email}</td>
                        <td className="p-3 border">
                          {new Date(app.submitted_at).toLocaleString()}
                        </td>
                        <td className="p-3 border">
                          <a
                            className="text-[#0d6832] underline"
                            href={`http://127.0.0.1:5000/uploads/${app.filename}`}
                            download
                          >
                            Download CV
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Matching Results */}
            {/* Matching Results */}
{rankedResults.length > 0 && (
  <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
    <h2 className="text-2xl font-bold mb-6">Matching Results</h2>

    {rankedResults.map((r, index) => (
      <div
        key={index}
        className="border rounded-xl p-6 mb-8 shadow-sm bg-[#fafafa]"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-lg font-semibold text-[#0d6832]">
              {r.applicant_name}
            </p>
            <p className="text-sm text-slate-600">
              {r.applicant_email}
            </p>
          </div>

          <div className="text-3xl font-bold text-[#0d6832]">
            {r.score?.toFixed(1)}%
          </div>
        </div>

        {/* Years of Experience */}
        <SkillSection
          title="Years of Experience"
          items={r.years ? [`${r.years} years`] : []}
          color="#0d6832"
        />

        {/* Matched Skills */}
        <SkillSection
          title="Matched Skills"
          items={r.matched_skills || []}
          color="#0d6832"
        />

        {/* Missing MUST Skills */}
        <SkillSection
          title="Missing MUST-Have Skills"
          items={r.missing_must || []}
          color="#b91c1c"
        />

        {/* Missing NICE Skills */}
        <SkillSection
          title="Missing NICE-to-Have Skills"
          items={r.missing_nice || []}
          color="#d97706"
        />
      </div>
    ))}
  </div>
)}

          </>
        )}
        {editPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-[500px]">
      <h2 className="text-xl font-bold mb-4 text-[#0d6832]">Edit Job</h2>

      <label className="text-sm font-medium">Job Title</label>
      <input
        className="w-full p-3 border rounded-xl mb-4"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
      />

      <label className="text-sm font-medium">Job Description</label>
      <textarea
        className="w-full p-3 border rounded-xl h-40"
        value={editDesc}
        onChange={(e) => setEditDesc(e.target.value)}
      />

      <div className="flex justify-end gap-3 mt-5">
        <button
          className="px-4 py-2 bg-gray-300 rounded-lg"
          onClick={() => setEditPopup(false)}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-[#0d6832] text-white rounded-lg"
          onClick={async () => {
            const res = await fetch(`${API_BASE}/jobs/update/${editJobId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: editTitle,
                description: editDesc,
              }),
            });

            if (res.ok) {
              alert("Job updated!");
              setEditPopup(false);
              refreshJobs();
            } else {
              alert("Failed to update job.");
            }
          }}
        >
          Update
        </button>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
}

/* ============================================================
   SKILL SECTION COMPONENT — MUST BE OUTSIDE MAIN COMPONENT
   ============================================================ */
function SkillSection({ title, items, color }) {
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-2" style={{ color }}>
        {title}
      </h3>

      {!items || items.length === 0 ? (
        <p className="text-slate-500 text-sm">None</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-[#f0f7f3] text-[#0d6832] border rounded-full text-xs shadow-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

