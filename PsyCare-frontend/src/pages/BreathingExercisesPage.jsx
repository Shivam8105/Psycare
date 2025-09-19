import React from "react";
import { useParams } from "react-router-dom";
import heroBackground from '@/assets/hero-illustration.jpg';

// Hardcoded list of breathing exercises
const exercises = [
  {
    title: "Box Breathing",
    description: "Inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat.",
  },
  {
    title: "4-7-8 Breathing",
    description: "Inhale for 4 seconds, hold for 7, and exhale for 8.",
  },
  {
    title: "Diaphragmatic Breathing",
    description: "Focus on deep breaths to engage your diaphragm.",
  },
];

export default function BreathingExercisesPage() {
  const { title } = useParams();

  return (
    <div
      className="min-h-screen relative py-12 px-4 bg-gray-50 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-1"></div>
      
      <div className="relative z-20 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{title}</h1>

        <div className="space-y-6">
          {exercises.map((exercise, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center transition-transform hover:scale-105">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{exercise.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
              </div>
              <button className="bg-violet-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-violet-600 transition-colors">
                Start
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}