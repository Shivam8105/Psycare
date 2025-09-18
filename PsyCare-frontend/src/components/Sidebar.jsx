import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Brain, MessageCircle, Calendar, BookOpen, Users, UserCheck, Home } from "lucide-react";

const sidebarItems = [
  { label: "Home", icon: Home, to: "/dashboard" },
  { label: "AI Chat", icon: MessageCircle, to: "/dashboard#ai-chat" },
  { label: "Book Counselor", icon: Calendar, to: "/dashboard#book" },
  { label: "Resources", icon: BookOpen, to: "/dashboard#resources" },
  { label: "Community", icon: Users, to: "/dashboard#community" },
  { label: "Appointments", icon: UserCheck, to: "/dashboard#appointments" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col pt-8 border-r border-border/50">
      <div className="flex items-center gap-3 px-6 mb-8">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-[#22223b]">PsyCare</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 px-4">
          {sidebarItems.map(item => {
            const [itemPath, itemHash = ""] = item.to.split("#");
            // location.hash includes the '#' prefix; itemHash does not.
            const isActive =
              location.pathname === itemPath &&
              (itemHash ? location.hash === `#${itemHash}` : location.hash === "");

            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[#67687e] hover:bg-[#f7f6ff] transition-all duration-200 ${isActive ? "bg-[#ece6fb] text-[#a682e3]" : ""}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
