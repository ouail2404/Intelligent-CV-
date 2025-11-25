import { UserCircleIcon } from "@heroicons/react/24/solid";

export default function ApplicantHeader() {
  const name = localStorage.getItem("name") || "User";
  const role =
    localStorage.getItem("role") === "hr" ? "HR Admin" : "Applicant";

  return (
    <div className="flex items-center gap-4 mb-8">

      <UserCircleIcon className="h-12 w-12 text-gray-600" />

      <div>
        <p className="text-xl font-semibold text-slate-900">
          {name}
        </p>

        <p className="text-sm text-slate-500 -mt-1">
          Applicant
        </p>
      </div>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        className="ml-auto px-6 py-2 bg-[#0d6832] text-white font-semibold rounded-xl shadow hover:bg-[#094d26] flex items-center gap-2 border px-5 py-2.5 rounded-xl shadow
       hover:bg-gray-800 hover:text-[black] hover:translate-x-2
       duration-500 transition-all"
      >
        Logout
      </button>

    </div>
  );
}
