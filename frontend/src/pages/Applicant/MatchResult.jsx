import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MatchResult() {
  const { id } = useParams();            //  GET job id
  const navigate = useNavigate();        

  const saved = localStorage.getItem("match_result");
  if (!saved) return <div>No result.</div>;

  const result = JSON.parse(saved);

  const score = result.score_percent || result.score || 0;

  const missingMust = result.missing_must || [];
  const missingNice = result.missing_nice || [];
  const matchedSkills = result.matched_skills || [];
  const suggestedSkills = result.suggestions || result.suggested_skills || [];

  return (
    <div className="bg-white p-10 border border-gray-200 rounded-xl shadow-sm max-w-4xl">
      
      
      <button
        onClick={() => navigate(`/applicant/job/${id}`)}
        className="text-black hover:text-[#0d6832] transition flex items-center gap-2 mb-5"
      >
        ← Back to Job
      </button>

      <h1 className="text-2xl font-semibold text-[#0d6832] mb-6">
        Match Result
      </h1>

      <div className="text-5xl font-bold text-[#0d6832] mb-4">
        {score.toFixed(1)}%
      </div>

      <div className="text-slate-600 text-sm mb-10">
        Based on semantic match, MUST/NICE criteria, experience fit, and skill overlap.
      </div>

      <ResultSection title="Suggestions to Improve Fit" items={suggestedSkills} color="#0d6832" />
      <ResultSection title="Matched Skills" items={matchedSkills} color="#0d6832" />
      <ResultSection title="Missing MUST-Have Skills" items={missingMust} color="#b91c1c" />
      <ResultSection title="Missing NICE-to-Have Skills" items={missingNice} color="#d97706" />
    </div>
  );
}

function ResultSection({ title, items, color }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3" style={{ color }}>
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">None</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((skill) => (
            <span
              key={skill}
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
