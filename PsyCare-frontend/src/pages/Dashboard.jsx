import React, { useState, useEffect } from "react";
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


const Dashboard = () => {
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
  const [stats] = useState({
    sessionsCompleted: 12,
    streakDays: 7,
    moodScore: 8.2,
    nextAppointment: "Tomorrow, 2:00 PM"
  });

  const [recentActivities] = useState([
    { id: 1, type: "chat", title: "AI Chat Session", time: "2 hours ago", status: "completed" },
    { id: 2, type: "appointment", title: "Dr. Smith Session", time: "Yesterday", status: "completed" },
    { id: 3, type: "resource", title: "Mindfulness Guide", time: "2 days ago", status: "viewed" },
    { id: 4, type: "community", title: "Posted in Anxiety Support", time: "3 days ago", status: "active" }
  ]);

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
                        <p className="text-lg font-bold text-gray-800">{stats.nextAppointment}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => setActiveSection(action.id)}
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
                      return (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.time}</p>
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
