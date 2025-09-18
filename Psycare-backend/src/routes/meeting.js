import express from "express";
import { scheduleMeeting, getMeetings, clearAllMeetings, markAsAttended } from "../controllers/meetingController.js";

const router = express.Router();

router.post("/schedule", scheduleMeeting);
router.get("/", getMeetings);
router.delete("/clear", clearAllMeetings);
router.patch("/attended/:id", markAsAttended);  

export default router;