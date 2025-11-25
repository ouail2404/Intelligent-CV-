import { Outlet, Link, useNavigate } from "react-router-dom";
import aui_logo from "../assets/aui_logo.png";
import ApplicantHeader from "./ApplicantHeader";

export default function ApplicantLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#f5f7fa]">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r shadow-lg p-6 flex flex-col">
        <img src={aui_logo} alt="AUI" className="h-20 mx-auto mb-8 opacity-90" />

        <nav className="space-y-4">
          <Link
            to="/applicant/applications"
            className="block px-4 py-3 rounded-xl bg-[#e6f4ec] text-[#0d6832] font-semibold 
            shadow-sm"
          >
            Job Listings
          </Link>

          <Link
            to="/applications"
            className="block px-4 py-3 rounded-xl text-[#0d6832] font-semibold 
             hover:bg-[#e6f4ec] transition-all duration-200"
          >
            My Applications
          </Link>

    

          
        </nav>

      
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-10 relative z-10">

    {/* ⭐ Profile Header */}
    <ApplicantHeader />

    <div className="mt-6">
        <Outlet />
    </div>

</main>

    </div>
  );
}
