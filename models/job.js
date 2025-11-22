import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: String,
  mustHaveSkills: [String],
  niceToHaveSkills: [String],
}, { timestamps: true });

export default mongoose.model("Job", JobSchema);
