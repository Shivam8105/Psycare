
// Express backend setup
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import passport from "./auth.js";
import session from "express-session";
import forumRoutes from "./routes/forum.js";
import appointment from "./routes/appointmentroutes.js";
import chatRoutes from "./routes/chatbotRoutes.js";
import wellnessRoutes from "./routes/wellnessRoutes.js";
import userRoutes from "./routes/user.js";
import testRoutes from "./routes/TestRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: ["https://psycare-frontend.onrender.com"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointment);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/forum", forumRoutes);

export default app;