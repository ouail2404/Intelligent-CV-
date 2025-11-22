import auilogo from "../assets/aui_logo.png";
import HRSidebar from "./HrSidebar";

export default function HRLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-auiGreen">
            Intelligent CV Screening – HR Admin
          </h1>
          <img src={auilogo} className="h-12" />
        </div>
      </header>

      <div className="flex">
        <HRSidebar />
        <main className="flex-1 px-10 py-10">{children}</main>
      </div>
    </div>
  );
}
