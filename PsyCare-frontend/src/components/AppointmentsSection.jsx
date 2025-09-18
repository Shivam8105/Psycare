import React, { useState, useEffect } from "react";
import LoginPrompt from "./ui/loginPrompt";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/api/appointments", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setError("unauthorized");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();

      // Transform backend data for display
      const formatted = data.data.map((appt) => {
        const student = appt.studentId;
        const therapist = appt.psychologistId;
        const dt = new Date(appt.appointmentTime);

        return {
          _id: appt._id,
          name: therapist.name,
          email: therapist.email,
          date: dt.toLocaleDateString(),
          time: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          duration: `${appt.duration} mins`,
          status: appt.status,
        };
      });

      setAppointments(formatted);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("network");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Cancel appointment
  const handleCancel = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setShowLoginPrompt(true);
        return;
      }

      const data = await res.json();
      if (data.error) {
        console.error(data.error);
        return;
      }

      // Remove cancelled appointment from UI
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const colorClasses = {
    pending: "bg-orange-100 text-orange-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="relative min-h-screen bg-transparent" id="appointments">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Your Appointments</h1>
          <p className="text-gray-600 text-sm">
            Manage your counseling sessions and track your mental health journey
          </p>
        </div>

        {loading && <p className="text-center text-gray-500">Loading...</p>}

        {!loading && error === "unauthorized" && (
          <p className="text-center text-gray-500">Please login to see your appointments.</p>
        )}

        {!loading && error === "network" && (
          <p className="text-center text-red-500">⚠️ Unable to fetch appointments. Try again later.</p>
        )}

        <div className="space-y-4">
          {appointments.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium">{s.name}</h3>
                  <p className="text-xs text-gray-500">{s.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-medium ${
                    colorClasses[s.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600">
                <span>📅 {s.date}</span>
                <span>🕑 {s.time}</span>
                <span>⏱ {s.duration}</span>
              </div>
              {s.status !== "cancelled" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => handleCancel(s._id)}
                    className="px-3 py-1 rounded-md text-xs border border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🚨 Show LoginPrompt only when cancelling unauthorized */}
      {showLoginPrompt && (
        <LoginPrompt
          onLogin={() => (window.location.href = "/login")}
          onSignup={() => (window.location.href = "/signup")}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
}
