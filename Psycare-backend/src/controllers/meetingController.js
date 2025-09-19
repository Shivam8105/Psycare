import { nanoid } from 'nanoid';
import { Meeting } from "../models/Meeting.js";
import  User from "../models/User.js";

console.log('Meeting import value:', Meeting);

export const scheduleMeeting = async (req, res) => {
  try {
    const { startTime, duration, token } = req.body;

    //finding user from token
    const user = await User.findOne({ token });
    if(!user){
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    console.log('Incoming body:', req.body);
    console.log('Meeting import at controller:', Meeting);

    const user_id = user.username;
    const meetingCode = nanoid(6).toUpperCase();

    const meeting = new Meeting({
      user_id,
      meetingCode,
      startTime,
      duration,
    });
    
    // console.log(meeting);
    await meeting.save();

    // Use your domain for the meeting link
    const meetingLink = `http://localhost:5001/meeting/${meetingCode}`;

    res.status(201).json({ success: true, meeting, meetingLink });
  } catch (error) {
    console.error('ScheduleMeeting Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getMeetings = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if(!authHeader){
      return res.status(401).json({ success: false, message: "Not token provided" });
    }

    const token = authHeader.split(" ")[1];
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const meetings = await Meeting.find({ 
      user_id: user.username }); 
    res.status(200).json({ success: true, meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const clearAllMeetings = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Only delete meetings for this user
    await Meeting.deleteMany({ 
      user_id: user.username });

    res.status(200).json({ success: true, message: "Your meetings cleared successfully" });
  } catch (error) {
    console.error("Clear Meetings Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsAttended = async(req, res) => {
  try{
    const { id } = req.params;
    const meeting = await Meeting.findByIdAndUpdate(
      id, 
      { $set: { status: "attended" }},
      { new: true }
    );
    res.json(meeting);
  }catch(err){
    res.status(500).json({ message: "Error marking as attended" });
  }
}
