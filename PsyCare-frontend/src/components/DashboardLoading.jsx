import React from "react";

const DashboardLoading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      <div className="mb-6 animate-spin">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="36" stroke="#a682e3" strokeWidth="8" strokeDasharray="56 56" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#22223b] mb-2">Creating your personalized dashboard...</h2>
      <p className="text-lg text-[#67687e]">Please wait while we set things up for you!</p>
    </div>
  );
};

export default DashboardLoading;
