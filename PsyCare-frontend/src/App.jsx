import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./context/UserContext.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import ChatSection from "./components/ChatSection.jsx";
import AppointmentsSection from "./components/AppointmentsSection.jsx";
import Ai_chat from "./components/AIChatSection.jsx";
import BookingSection from "./components/BookingSection.jsx";
import WellnessResources from "./components/ResourcesSection.jsx";
import CommunitySection from "./components/CommunitySection.jsx";
import Tests from "./components/Tests.jsx" // Chat page component
import AuthSelection from "./components/AuthSection.jsx";
import NotFound from "./pages/NotFound.jsx";
import Navbar from "./components/Navigation.jsx";
import { useUser } from "./context/UserContext.jsx";
import Profile from "./pages/Profile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AuthHandler from "./AuthHandler.jsx";
import TestPage from "./components/TestPage.jsx";

import AudioLibraryPage from "./pages/AudioLibraryPage.jsx";
import VideoPage from "./pages/VideoPage.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import BreathingExercisesPage from "./pages/BreathingExercisesPage.jsx";
import InteractiveGamesPage from "./pages/InteractiveGamesPage.jsx";


const queryClient = new QueryClient();


const App = () => {
  const { user } = useUser?.() || {};
  // Always show Navbar
  const showNavbar = true;
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserProvider>
          <BrowserRouter>
            <AuthHandler />
            {/* Conditionally render Navbar except on dashboard */}
            {showNavbar && <Navbar key={user?.id || user?.email || "navbar"} />}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/appointments" element={<AppointmentsSection />} />
              <Route path="/book" element={<BookingSection />} />
              <Route path="/resources" element={<WellnessResources />} />
              <Route path="/api/tests/:testId/questions" element={<TestPage />} />
              <Route path="/community" element={<CommunitySection />} />
              <Route path="/ai-chat" element={<Ai_chat />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/auth" element={<AuthSelection />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
