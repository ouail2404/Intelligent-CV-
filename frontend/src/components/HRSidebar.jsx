export default function HRSidebar() {
  return (
    <aside className="w-64 bg-white shadow-md h-screen p-6 border-r border-slate-200">
      <nav className="space-y-4">
        <a href="/create-job" className="block text-lg font-medium text-auiGreen hover:underline">
          Create Job
        </a>

        <a href="/" className="block text-lg font-medium text-auiGreen hover:underline">
          Match Candidates
        </a>
      </nav>
    </aside>
  );
}
