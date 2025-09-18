import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext.jsx";

import DashboardLoading from "./components/DashboardLoading.jsx";

const AuthHandler = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    // Always use default role, funnyName, avatar
    const role = 'student';
    const funnyName = 'jugaadu';
    const avatar = '😉';

    if (token) {
      setLoading(true);
      fetch('http://localhost:8080/api/auth/google/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role, name, email, avatar, funnyName })
      })
        .then(res => res.json())
        .then(data => {
          console.log('Google login user from backend:', data.user); // Debug log
          localStorage.setItem('token', data.token);
          setUser(data.user); // Update context for live navbar update
          setTimeout(() => {
            navigate('/dashboard'); // Redirect to dashboard after animation
          }, 1800); // Show animation for 1.8 seconds
        });
    }
  }, [setUser, navigate]);

  if (loading) {
    return <DashboardLoading />;
  }
  return null;
};

export default AuthHandler;