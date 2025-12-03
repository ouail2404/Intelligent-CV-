import { UserCircleIcon } from "@heroicons/react/24/solid";


export default function ApplicantHeader() {
  const name = localStorage.getItem("name") || "User";

  return (
    <div className="flex items-center justify-between mb-8">

      <div className="flex items-center gap-4">
        <UserCircleIcon className="h-12 w-12 text-gray-600" />
        <div>
          <p className="text-xl font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500 -mt-1">Applicant</p>
        </div>
      </div>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        className="px-6 py-2 bg-[#0d6832] text-white font-semibold rounded-xl shadow hover:bg-[#094d26] transition-all"
      >
        Logout
      </button>

    </div>
  );
}
