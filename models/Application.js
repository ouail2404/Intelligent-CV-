import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  jobId: String,
  applicantName: String,
  applicantEmail: String,
  score: Number,
  fit: String,
  years: Number,
  matched_skills: [String],
  missing_must: [String],
  missing_nice: [String],
  extra_skills: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Application", ApplicationSchema);
