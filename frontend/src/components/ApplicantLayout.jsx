import { Outlet, Link } from "react-router-dom";
import aui_logo from "../assets/aui_logo.png";

export default function ApplicantLayout() {
  return (
    <div className="p-6">
      <img src={aui_logo} alt="AUI" className="h-24 mb-4" />

      <h1 className="text-3xl font-bold mb-4 text-[#0d6832]">
        Intelligent CV Screening — Applicants
      </h1>

      <Link to="/applicant/">Job Listings</Link>



      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
