import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ApplicantLayout from "../../components/ApplicantLayout.jsx";

const API = "http://127.0.0.1:5000/api";

export default function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch(`${API}/jobs/list`)
      .then(res => res.json())
      .then(data => setJobs(data.filter(j => j.title)));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#0d6832] mb-6">
        Available Jobs
      </h1>

      <div className="space-y-4 max-w-3xl">
        {jobs.map(job => (
          <Link
  key={job._id}
  to={`job/${job._id}`}
  className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition"
>
  <h2 className="text-lg font-bold text-[#0d6832]">{job.title}</h2>
  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
    {job.description.slice(0, 150)}...
  </p>

  <div className="flex items-center space-x-4 mt-4 text-xs text-slate-500">
    <span className="bg-[#e6f4ec] text-[#0d6832] px-3 py-1 rounded-full">
      Open Position
    </span>
  </div>
</Link>

        ))}
      </div>
    </div>
  );
}
