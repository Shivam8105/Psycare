import express from "express";
import Appointment from "../models/Appointments.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { nanoid } from "nanoid";

const router = express.Router();


// Clear all appointments for the logged-in user
router.post("/clear", authMiddleware, async (req, res) => {
  try {
    let result;
    if (req.user?.role?.toLowerCase() === "student") {
      result = await Appointment.deleteMany({ studentId: req.user.id });
    } else if (req.user?.role?.toLowerCase() === "psychologist") {
      result = await Appointment.deleteMany({ psychologistId: req.user.id });
    } else {
      return res.status(403).json({ error: "Access denied. Invalid role.", user: req.user });
    }
    res.json({ message: "All appointments cleared", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ 1. Student books appointment (with conflict check)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Only students can book" });

  const { psychologistId, appointmentTime, duration } = req.body;
  console.log("Logged-in user:", req.user);


  try {
    const startTime = new Date(appointmentTime);
    const endTime = new Date(startTime.getTime() + (duration || 30) * 60000);

    // Prevent double booking for psychologist
    const psychConflict = await Appointment.findOne({
      psychologistId,
      status: { $ne: "cancelled" },
      appointmentTime: { $lt: endTime },
      $expr: { $gt: [{ $add: ["$appointmentTime", { $multiply: ["$duration", 60000] }] }, startTime] }
    });
    if (psychConflict) return res.status(400).json({ error: "Psychologist already has an appointment in this slot" });

    // Prevent double booking for student
    const studentConflict = await Appointment.findOne({
      studentId: req.user.id,
      status: { $ne: "cancelled" },
      appointmentTime: { $lt: endTime },
      $expr: { $gt: [{ $add: ["$appointmentTime", { $multiply: ["$duration", 60000] }] }, startTime] }
    });
    if (studentConflict) return res.status(400).json({ error: "You already have an appointment in this slot" });

    const meetingCode = nanoid(6).toUpperCase();

    const appointment = await Appointment.create({
      studentId: req.user.id,
      psychologistId,
      appointmentTime: startTime,
      duration: duration || 30,
      status: "pending",
      meetingCode
    });

    // ✅ 2. Notification placeholder (e.g. email)
    console.log(`📩 Notification: Appointment booked by ${req.user.name}`);

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ✅ 3. Get appointments with filters & pagination
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 req.user from token:", req.user); // 👈 log payload

    const { status, from, to, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user?.role?.toLowerCase() === "student") {
      query.studentId = req.user.id;
    } else if (req.user?.role?.toLowerCase() === "psychologist") {
      query.psychologistId = req.user.id;
    } else {
      return res.status(403).json({ error: "Access denied. Invalid role.", user: req.user });
    }

    // rest of your code...


    // ✅ Add optional filters
    if (status) query.status = status;

    if (from || to) {
      query.appointmentTime = {};
      if (from) query.appointmentTime.$gte = new Date(from);
      if (to) query.appointmentTime.$lte = new Date(to);
    }

    // ✅ Fetch with pagination + sorting
    const appointments = await Appointment.find(query)
      .populate("studentId", "name email")
      .populate("psychologistId", "name email")
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ appointmentTime: 1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: appointments,
    });
  } catch (err) {
    console.error("Appointments fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});




// ✅ 4. Psychologist updates appointment status
router.patch("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "psychologist") return res.status(403).json({ error: "Only psychologists can update" });

  const { status } = req.body;
  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updated = await Appointment.findOneAndUpdate(
      { _id: req.params.id, psychologistId: req.user.id },
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Appointment not found" });

    console.log(`📩 Notification: Appointment ${status} by psychologist ${req.user.name}`);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 5. Student cancels appointment
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Only students can cancel" });

  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.id },
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    console.log(`📩 Notification: Appointment cancelled by student ${req.user.name}`);

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;