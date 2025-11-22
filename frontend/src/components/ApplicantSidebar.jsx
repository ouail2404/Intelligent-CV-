export default function ApplicantSidebar() {
  return (
    <aside className="w-60 bg-white border-r h-screen pt-8 px-6 text-sm">
      <nav className="space-y-3">
        <a 
          href="/applicant" 
          className="block px-3 py-2 rounded-lg text-[#0d6832] font-medium hover:bg-[#e6f4ec] transition"
        >
          Job Listings
        </a>
      </nav>
    </aside>
  );
}
