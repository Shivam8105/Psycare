import mongoose, {Schema} from "mongoose";

const meetingSchema = new Schema({
    user_id: { type: String, required: true },
    meetingCode: { type: String, unique: true },
    startTime: { type: Date, default: Date.now }, 
    duration: { type: Number, default: 30 },
    status: { 
        type: String,
        enum: ["attended", "not attended"],
        default: "not attended"
    },
    createdAt: { type: Date, default: Date.now } 
})

const Meeting = mongoose.model("Meeting", meetingSchema);
export { Meeting };