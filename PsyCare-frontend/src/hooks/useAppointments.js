import { useEffect, useState } from "react";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ include cookies/session
      });

      if (res.status === 401) {
        setError("unauthorized");
        setAppointments([]);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setAppointments(data); // backend should return array
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setError("network");
    }
    setLoading(false);
  };

  const cancelAppointment = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        setError("unauthorized");
        return;
      }

      if (!res.ok) throw new Error("Cancel failed");

      // remove from UI
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Cancel appointment error:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return { appointments, loading, error, fetchAppointments, cancelAppointment };
}
