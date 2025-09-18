import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Heart, 
  Clock,
  Star,
  TrendingUp,
  Activity,
  User,
  ChevronRight,
  Plus
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import axios from "axios";


const Dashboard = () => {
  const navigate = useNavigate();
  // Mock user data
  const [user] = useState({
    name: "Alex Johnson",
    email: "alex@student.edu",
    avatar: "😊",
    role: "student",
    funnyName: "Stress Warrior"
  });

  const [showWelcome, setShowWelcome] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  // Hide welcome message after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for dashboard widgets
  // Load persisted state from localStorage
  const getPersistedStats = () => {
    const stats = JSON.parse(localStorage.getItem("wellnessStats"));
    return stats || { sessionsCompleted: 12, streakDays: 0, moodScore: 0, nextAppointment: "" };
  };
  const getPersistedActivities = () => {
    return JSON.parse(localStorage.getItem("wellnessActivities")) || [
      { id: 1, type: "chat", title: "AI Chat Session", time: "2 hours ago", status: "completed" },
      { id: 2, type: "appointment", title: "Dr. Smith Session", time: "Yesterday", status: "completed" },
      { id: 3, type: "resource", title: "Mindfulness Guide", time: "2 days ago", status: "viewed" },
      { id: 4, type: "community", title: "Posted in Anxiety Support", time: "3 days ago", status: "active" }
    ];
  };
  const getPersistedMood = () => localStorage.getItem("selectedMood") || null;
  const getPersistedWellnessTime = () => Number(localStorage.getItem("lastWellnessTime")) || null;

  const [stats, setStats] = useState(getPersistedStats());
  const [recentActivities, setRecentActivities] = useState(getPersistedActivities());
  // Remove activities older than 3 minutes every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRecentActivities(prev => prev.filter(activity => {
        // Only keep activities with a timestamp within 3 minutes
        if (typeof activity.time === "number") {
          return now - activity.time <= 3 * 60 * 1000;
        }
        // Remove all activities with string time (legacy or mock data)
        return false;
      }));
    }, 30 * 1000); // check every 30 seconds for faster removal
    return () => clearInterval(interval);
  }, []);
  const moodEmojis = [
    { emoji: "😄", score: 10 },
    { emoji: "🙂", score: 8 },
    { emoji: "😐", score: 6 },
    { emoji: "😔", score: 4 },
    { emoji: "😢", score: 2 }
  ];
  const [selectedMood, setSelectedMood] = useState(getPersistedMood());
  const [lastWellnessTime, setLastWellnessTime] = useState(getPersistedWellnessTime());
  const [wellnessBlocked, setWellnessBlocked] = useState(false);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("wellnessStats", JSON.stringify(stats));
  }, [stats]);
  useEffect(() => {
    localStorage.setItem("wellnessActivities", JSON.stringify(recentActivities));
  }, [recentActivities]);
  useEffect(() => {
    if (selectedMood) localStorage.setItem("selectedMood", selectedMood);
  }, [selectedMood]);
  useEffect(() => {
    if (lastWellnessTime) localStorage.setItem("lastWellnessTime", lastWellnessTime);
  }, [lastWellnessTime]);

  // Fetch next upcoming appointment (any status) on mount
  const [nextApptDetails, setNextApptDetails] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/api/appointments?limit=1", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          const appt = data.data[0];
          setNextApptDetails({
            name: appt.psychologistId?.name || "Psychologist",
            email: appt.psychologistId?.email || "",
            status: appt.status,
            date: new Date(appt.appointmentTime).toLocaleDateString(),
            time: new Date(appt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: appt.duration,
          });
          setStats(prev => ({ ...prev, nextAppointment: null }));
        } else {
          setNextApptDetails(null);
          setStats(prev => ({ ...prev, nextAppointment: "No upcoming appointments" }));
        }
      })
      .catch(() => {
        setNextApptDetails(null);
        setStats(prev => ({ ...prev, nextAppointment: "No upcoming appointments" }));
      });
  }, []);

  // Streak reset logic
  useEffect(() => {
    if (lastWellnessTime) {
      const now = Date.now();
      if (now - lastWellnessTime > 24 * 60 * 60 * 1000) {
        setStats(prev => ({ ...prev, streakDays: 0 }));
        setSelectedMood(null);
      }
    }
  }, [lastWellnessTime]);

  const [quickActions] = useState([
    { id: 'chat', icon: MessageCircle, title: 'AI Chat', description: 'Get instant support', color: 'bg-blue-500' },
    { id: 'book', icon: Calendar, title: 'Book Session', description: 'Schedule counseling', color: 'bg-green-500' },
    { id: 'resources', icon: BookOpen, title: 'Resources', description: 'Wellness materials', color: 'bg-purple-500' },
    { id: 'community', icon: Users, title: 'Community', description: 'Connect with peers', color: 'bg-orange-500' }
  ]);

  const sidebarItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'chat', icon: MessageCircle, label: 'AI Chat' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'resources', icon: BookOpen, label: 'Resources' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'wellness', icon: Heart, label: 'Wellness Tracker' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'chat': return MessageCircle;
      case 'appointment': return Calendar;
      case 'resource': return BookOpen;
      case 'community': return Users;
      default: return Activity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'viewed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle emoji select for daily wellness
  const handleEmojiSelect = (emojiObj) => {
    // Check 24h block
    if (lastWellnessTime && Date.now() - lastWellnessTime < 24 * 60 * 60 * 1000) {
      setWellnessBlocked(true);
      toast.error("Daily Wellness already completed!", {
        description: "You can log your wellness again after 24 hours.",
        duration: 4000,
      });
      return;
    }
    setSelectedMood(emojiObj.emoji);
    setStats((prev) => ({
      ...prev,
      streakDays: prev.streakDays + 1,
      moodScore: emojiObj.score
    }));
    setRecentActivities((prev) => [
      { id: Date.now(), type: "wellness", title: `Wellness: ${emojiObj.emoji}`, time: Date.now(), status: "completed" },
      ...prev
    ]);
    setLastWellnessTime(Date.now());
    setWellnessBlocked(false);
    toast.success("Daily Wellness completed!", {
      description: "Your streak and mood score have been updated.",
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Welcome Message with Auto-hide */}
      {showWelcome && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-500">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{user.avatar}</span>
              <div>
                <h3 className="font-bold">Welcome back, {user.funnyName}! 👋</h3>
                <p className="text-blue-100 text-sm">Ready for your wellness journey?</p>
              </div>
            </div>
            <div className="mt-2 bg-white/20 rounded-full h-1">
              <div className="bg-white h-1 rounded-full animate-pulse" style={{width: '100%', animation: 'progress 4s linear'}}></div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen">
        {/* Main Content */}
        <div className="w-full overflow-auto">
          {/* Dashboard Content (Header Removed) */}
          <main className="p-6">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Sessions Completed</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.sessionsCompleted}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Streak Days</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.streakDays}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Mood Score</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.moodScore}/10</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Next Appointment</p>
                        {nextApptDetails ? (
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-gray-800">{nextApptDetails.name}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="inline-flex items-center"><Clock className="w-4 h-4 mr-1 text-orange-600" />{nextApptDetails.date} {nextApptDetails.time}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-gray-800">{stats.nextAppointment}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Quick Actions + Daily Wellness Emoji Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="mb-4">
                    <p className="font-medium text-gray-700 mb-2">Log your daily wellness:</p>
                    <div className="flex gap-2 items-center">
                      {moodEmojis.map((mood) => (
                        <button
                          key={mood.emoji}
                          onClick={() => handleEmojiSelect(mood)}
                          disabled={wellnessBlocked}
                          className={`text-3xl p-2 rounded-lg border-2 transition-all duration-200 ${selectedMood === mood.emoji ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} ${wellnessBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-400 hover:bg-green-50'}`}
                        >
                          {mood.emoji}
                        </button>
                      ))}
                      {/* Share on Community button, shown only after emoji selected and not blocked */}
                      {selectedMood && !wellnessBlocked && (
                        <button
                          onClick={async () => {
                            // Only allow one wellness post per day
                            const lastShared = localStorage.getItem("lastWellnessShared");
                            if (lastShared && Date.now() - Number(lastShared) < 24 * 60 * 60 * 1000) {
                              toast.error("You have already shared your wellness today.", {
                                description: "You can share again after 24 hours.",
                                duration: 4000,
                              });
                              return;
                            }
                            try {
                              const token = localStorage.getItem("token");
                              await axios.post(
                                "http://localhost:8080/api/forum",
                                {
                                  title: "Wellness Update",
                                  content: `My wellness status today: ${selectedMood}`
                                },
                                {
                                  headers: { Authorization: `Bearer ${token}` }
                                }
                              );
                              setRecentActivities((prev) => [
                                { id: Date.now() + Math.floor(Math.random()*1000), type: "community", title: `Shared wellness status: ${selectedMood}`, time: Date.now(), status: "active" },
                                ...prev
                              ]);
                              localStorage.setItem("lastWellnessShared", Date.now());
                              toast.success("Shared on Community!", {
                                description: "Your wellness status has been posted.",
                                duration: 4000,
                              });
                            } catch (err) {
                              toast.error("Failed to share on community.", {
                                description: err?.response?.data?.message || "Please try again later.",
                                duration: 4000,
                              });
                            }
                          }}
                          className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-200"
                        >
                          Share on Community
                        </button>
                      )}
                    </div>
                    {wellnessBlocked && (
                      <p className="text-red-500 text-sm mt-2">You can log wellness again after 24 hours.</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      let route = "/";
                      if (action.id === "chat") route = "/ai-chat";
                      if (action.id === "book") route = "/appointments";
                      if (action.id === "resources") route = "/resources";
                      if (action.id === "community") route = "/community";
                      return (
                        <button
                          key={action.id}
                          onClick={() => navigate(route)}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                        >
                          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-800">{action.title}</p>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const Icon = getActivityIcon(activity.type);
                      // Show time as 'Just now' if <1min, else in minutes
                      let timeDisplay = "Just now";
                      if (typeof activity.time === "number") {
                        const diff = Date.now() - activity.time;
                        if (diff >= 60 * 1000) {
                          timeDisplay = `${Math.floor(diff / 60000)} min ago`;
                        }
                      } else {
                        timeDisplay = activity.time;
                      }
                      return (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{activity.title}</p>
                            <p className="text-sm text-gray-600">{timeDisplay}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {activeSection !== 'overview' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {sidebarItems.find(item => item.id === activeSection)?.label} Section
                </h2>
                <p className="text-gray-600">
                  This section is under development. Content will be added soon!
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-in {
          animation: slideInFromTop 0.5s ease-out;
        }
        @keyframes slideInFromTop {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
