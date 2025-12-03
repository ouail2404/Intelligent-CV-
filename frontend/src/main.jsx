import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// HR Admin Dashboard
import App from "./App.jsx";

// Applicant UI
import ApplicantLayout from "./components/ApplicantLayout.jsx";
import JobList from "./pages/Applicant/JobList.jsx";
import JobDetails from "./pages/Applicant/JobDetails.jsx";
import MatchResult from "./pages/Applicant/MatchResult.jsx";
import MyApplications from "./components/Myapplications.jsx";

// Auth
import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";

function Main() {

  const handleLogin = (role) => {
    if (role === "hr") window.location.href = "/hr";
    else window.location.href = "/applicant";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={() => window.location.href = "/login"} />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/hr" element={<App />} />

        <Route path="/applicant" element={<ApplicantLayout />}>
          <Route index element={<JobList />} />
          <Route path="job/:id" element={<JobDetails />} />
          <Route path="match/:id" element={<MatchResult />} />
        </Route>

        <Route path="/applications" element={<MyApplications />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
