import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const userId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).id
    : null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:8080/api/tests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTests(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    if (userId) {
      axios
        .get(`http://localhost:8080/api/tests/user/${userId}/allreport`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const progressMap = {};
          if (res.data.reports) {
            res.data.reports.forEach((report) => {
              for (const [testId, scores] of Object.entries(report.progress)) {
                if (!progressMap[testId]) progressMap[testId] = [];
                progressMap[testId].push({ date: report.last_updated, scores });
              }
            });
          }
          setReports(progressMap);
        })
        .catch((err) => console.error(err));
    }
  }, [token, userId]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-purple-700">
        Loading tests...
      </p>
    );
  }

  return (
  <div className="min-h-screen flex flex-col items-center py-16 px-4 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">

      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">
        Wellness & Mental Health Tests
      </h2>
      <p className="text-center text-gray-700 mb-12 max-w-2xl text-base md:text-lg">
        Choose a test to explore different aspects of your mental well-being.
      </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl z-10">
        {tests.length === 0 && (
          <p className="text-center text-gray-700 col-span-full">
            No tests available.
          </p>
        )}

      {tests.map((test) => {
        const lastReport =
          reports[test._id]?.[0]?.scores?.slice(-1)[0] || null;

        return (
          <div
            key={test._id}
            className="flex flex-col justify-between bg-white border border-purple-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-200 group min-h-[210px]"
          >
            <div className="flex-1 flex flex-col justify-between">
              <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-purple-700">
                {test.test_name}
              </h3>
              <p className="text-sm text-gray-700 opacity-90 mb-2">
                {test.description}
              </p>
              {lastReport !== null && (
                <p className="mt-2 text-sm text-gray-800">
                  Last Score: <span className="font-semibold text-purple-700">{lastReport}</span>
                </p>
              )}
            </div>
            <div className="mt-5">
              <Link
                to={`/tests/${test._id}`}
                className="block w-full text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition text-sm"
              >
                Start the Test
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  </div>
  );
};

export default Tests;