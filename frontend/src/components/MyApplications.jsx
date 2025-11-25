import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApplicantHeader from "./ApplicantHeader.jsx";
import aui_logo from "../assets/aui_logo.png";

const API = "http://127.0.0.1:5000/api";

export default function MyApplications() {

  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState("");

  const userEmail = localStorage.getItem("email");

  // FETCH APPLICATIONS
  useEffect(() => {
    fetch(`${API}/applications/recent`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.recent.filter(
          (a) => a.applicant_email === userEmail
        );
        setApps(filtered);
      });
  }, []);

  // FILTER BY SEARCH
  const filteredApps = apps.filter((app) =>
    app.job_title.toLowerCase().includes(search.toLowerCase())
  );

  // STATS
  const totalApps = apps.length;

  const avgMatch =
    apps.length > 0
      ? (
          apps
            .filter((a) => a.match_score !== null)
            .reduce((sum, a) => sum + a.match_score, 0) / apps.length
        ).toFixed(1)
      : 0;

  return (
    <div className="flex w-full">

      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-64 bg-white border-r shadow-lg p-6 flex flex-col">
        <img src={aui_logo} alt="AUI" className="h-20 mx-auto mb-8 opacity-90" />
        

        <nav className="space-y-4">
          <Link
            to="/applicant"
            className="block px-4 py-3 rounded-xl text-[#0d6832] font-semibold 
            hover:bg-[#e6f4ec] transition-all duration-200"
          >
            Job Listings
          </Link>

          <Link
            to="/applicant/applications"
            className="block px-4 py-3 rounded-xl bg-[#e6f4ec] text-[#0d6832] font-semibold 
            shadow-sm"
          >
            My Applications
          </Link>

          
        </nav>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 px-10 py-10 bg-[#f5f7fa]">
        <ApplicantHeader />

        <h1 className="text-4xl font-extrabold text-[#0d6832] text-center mb-3">
          My Applications
        </h1>

        <p className="text-center text-slate-600 mb-10">
          Track and manage your submitted job applications.
        </p>

        {/* ---------- SEARCH BAR ---------- */}
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Search your applied jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2 px-4 py-3 border rounded-xl shadow-sm text-sm"
          />
        </div>

        {/* ---------- Stats Cards ---------- */}
        <div className="grid grid-cols-2 gap-6 mt-10 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow border">
            <p className="text-sm text-slate-600">Total Applications</p>
            <h2 className="text-4xl font-bold mt-2 text-[#0d6832]">
              {totalApps}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border">
            <p className="text-sm text-slate-600">Average Match Score</p>
            <h2 className="text-4xl font-bold mt-2 text-[#0d6832]">
              {avgMatch}%
            </h2>
          </div>
        </div>

        {/* ---------- Applications Grid (3 columns) ---------- */}
        <div className="grid md:grid-cols-3 gap-8">
          {filteredApps.length === 0 && (
            <p className="text-slate-600 text-lg">
              No applications found matching your search.
            </p>
          )}

          {filteredApps.map((app) => (
            <div
              key={app._id}
              className="bg-white border rounded-2xl shadow-sm p-8 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-[#0d6832]">
                    {app.job_title}
                  </h2>

                  <p className="text-sm text-slate-500 mt-2">
                    Submitted on{" "}
                    <span className="font-semibold">
                      {new Date(app.submitted_at).toLocaleString()}
                    </span>
                  </p>

                  {/* Match Score */}
                  {app.match_score !== null && (
                    <div className="mt-5">
                      <p className="text-sm text-slate-600 mb-1 font-medium">
                        Match Score
                      </p>

                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0d6832] rounded-full"
                          style={{ width: `${app.match_score}%` }}
                        />
                      </div>

                      <p className="text-sm text-[#0d6832] font-semibold mt-1">
                        {app.match_score.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>

                
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
