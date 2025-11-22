import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [jobId, setJobId] = useState("");
  const [apps, setApps] = useState([]);

  const loadApplications = async () => {
    if (!jobId) return;

    const res = await fetch(
      `http://localhost:7000/api/admin/applications/${jobId}`
    );
    const data = await res.json();
    setApps(data);
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h1>HR Admin – Applicants</h1>

      <div className="card">
        <input
          placeholder="Enter Job ID"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="input"
        />
        <button onClick={loadApplications}>Load Applicants</button>
      </div>

      <hr />

      {apps.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <table border="1" width="100%" cellPadding={10}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Matched Skills</th>
            </tr>
          </thead>

          <tbody>
            {apps.map((app, i) => (
              <tr key={i}>
                <td>{app.applicantName}</td>
                <td>{app.applicantEmail}</td>
                <td style={{ fontWeight: "bold" }}>
                  {(app.score * 100).toFixed(1)}%
                </td>
                <td>
                  {app.matched_skills?.join(", ") || "Not stored yet"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
