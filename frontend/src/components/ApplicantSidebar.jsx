export default function ApplicantSidebar() {
  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 h-screen py-8 px-6 shadow-xl">
      <nav className="space-y-3">

        <a
          href="/applicant"
          className="block px-4 py-3 rounded-xl text-[#0d6832] font-semibold 
          hover:bg-[#e6f4ec] transition-all duration-200 hover:shadow-md"
        >
          Job Listings
        </a>

      </nav>
    </aside>
  );
}
