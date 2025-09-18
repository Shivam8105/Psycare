import { useState } from "react";
import { Bot, Send, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoginPrompt from "./ui/loginPrompt";

const AIChatSection = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋, I'm PsyCare. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [lang, setLang] = useState("en"); // default language
  const token = localStorage.getItem("token");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: input, lang }),
        credentials: "include",
      });

      if (response.status === 401) {
        setShowLoginPrompt(true);
        setLoading(false);
        return;
      }

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();

      // ✅ Suicidal / emergency handling
      if (data.escalate) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.emergencyMessage },
        ]);

        data.hotlines?.forEach((h) => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `Hotline: ${h.name} - ${h.phone || h.website}`,
            },
          ]);
        });

        data.therapists?.forEach((t) => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `Available Therapist: ${t.name} (${t.email})`,
            },
          ]);
        });

        // ✅ Booking handling
      } else if (data.bookingSuccess !== undefined) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.message }]);

        if (data.appointment) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `Appointment Details:\nTherapist ID: ${
                data.appointment.psychologistId
              }\nStudent ID: ${data.appointment.studentId}\nTime: ${new Date(
                data.appointment.appointmentTime
              ).toLocaleString()}\nStatus: ${data.appointment.status}`,
            },
          ]);
        }

        // ✅ Normal chat
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.reply || data.message || "Sorry, I didn’t understand.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setShowLoginPrompt(true);
    }

    setLoading(false);
  };

  return (
    <section id="ai-chat" className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-foreground">
            AI Chat Support
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Talk to our AI for instant guidance and coping strategies
          </p>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="flex justify-between items-center">
            {/* Assistant */}
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <span className="font-medium">PsyCare Assistant</span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="border border-border rounded-md px-2 py-1 text-sm bg-background shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="ta">தமிழ்</option>
                <option value="bn">বাংলা</option>
                <option value="te">తెలుగు</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="h-64 bg-muted/30 rounded-md mb-4 p-4 overflow-auto text-sm">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 ${
                    msg.sender === "user"
                      ? "text-right text-foreground"
                      : "text-left text-muted-foreground"
                  }`}
                >
                  <span
                    className={`inline-block px-3 py-2 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="text-left text-muted-foreground">Typing...</div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={loading}>
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <LoginPrompt
          onLogin={() => (window.location.href = "/auth")}
          onSignup={() => (window.location.href = "/auth")}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </section>
  );
};

export default AIChatSection;
