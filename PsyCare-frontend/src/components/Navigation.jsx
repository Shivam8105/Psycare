import { useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import {
  Menu,
  X,
  Brain,
  MessageCircle,
  Calendar,
  BookOpen,
  Users,
  UserCheck,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Use user context for live updates
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  // Debug log to trace user context
  console.log("Navbar user context:", user);

  const navItems = [
    user
    ? { to: "/dashboard", label: "Dashboard", icon: Brain }
    : { to: "/", label: "Home", icon: Brain },
    { to: "/ai-chat", label: "AI Chat", icon: MessageCircle },
    { to: "/book", label: "Book", icon: Calendar },
    { to: "/resources", label: "Resources", icon: BookOpen },
    { to: "/community", label: "Community", icon: Users },
    { to: "/appointments", label: "Appointments", icon: UserCheck },
    // Removed Chat link
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-poppins text-foreground">
                PsyCare
              </h1>
              <p className="text-xs text-muted-foreground">by NeuroNova</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 relative">
            {user && user.avatar && user.funnyName ? (
              <>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f7f6ff] border border-[#eeebfa] focus:outline-none"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                >
                  <span className="text-2xl">{user.avatar}</span>
                  <span className="font-semibold text-[#a682e3]">{user.funnyName}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setUser(null);
                        setShowUserMenu(false);
                        navigate("/");
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/auth">
                <Button
                  size="sm"
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign In / Sign Up
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-medium animate-slide-in">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Auth Buttons in Mobile */}
            <div className="pt-4 border-t border-border/50 space-y-2">
              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f7f6ff] border border-[#eeebfa] w-full focus:outline-none"
                    onClick={() => setShowUserMenu((prev) => !prev)}
                  >
                    <span className="text-2xl">{user.avatar || "😊"}</span>
                    <span className="font-semibold text-[#a682e3]">{user.funnyName || user.name || "User"}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                        onClick={() => { setShowUserMenu(false); setIsMenuOpen(false); }}
                      >
                        Profile
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("user");
                          setUser(null);
                          setShowUserMenu(false);
                          setIsMenuOpen(false);
                          navigate("/");
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign In / Sign Up
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
