import aui_logo from "../assets/aui_logo.png";

export default function ApplicantHeader() {
  return (
    <header className="w-full bg-white shadow-sm py-4 px-12 flex items-center justify-between border-b">
      <h1 className="text-xl font-semibold tracking-tight text-[#0d6832]">
        Intelligent CV Screening – Applicants
      </h1>

      <img src={aui_logo} alt="AUI Logo" className="h-10 opacity-90" />
    </header>
  );
}
