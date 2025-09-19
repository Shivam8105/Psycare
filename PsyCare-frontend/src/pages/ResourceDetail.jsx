import React from "react";
import { useParams } from "react-router-dom";

const resourceDetails = {
  "Stress-Management": {
    title: "Stress Management",
    description: "Learn effective techniques to manage academic and personal stress.",
    details: "12 exercises",
  },
  // Add more resources here as needed
};

export default function ResourceDetail() {
  const { resourceName } = useParams();
  const resource = resourceDetails[resourceName] || null;

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Resource Not Found</h2>
          <p className="mb-4">Sorry, we couldn't find details for this resource.</p>
          <a href="/resources" className="text-blue-500 underline hover:text-blue-700">Back to Resources</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg bg-white rounded-xl shadow p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
        <p className="text-gray-700 mb-4">{resource.description}</p>
        <p className="text-gray-500 text-sm">{resource.details}</p>
        <a href="/resources" className="mt-6 inline-block text-violet-600 underline hover:text-violet-800">Back to Resources</a>
      </div>
    </div>
  );
}
