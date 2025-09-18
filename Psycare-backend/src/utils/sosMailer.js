import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const SOS_EMAIL = process.env.SOS_EMAIL || "newshivam8105@gmail.com";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendSOSMail({ name, email, mobile, location, message }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: SOS_EMAIL,
    subject: "SOS Alert: Suicidal Message Detected",
    text: `A user has sent a dangerous message to the chatbot.\n\nName: ${name}\nEmail: ${email}\nMobile: ${mobile}\nLocation: ${location || "Not provided"}\nMessage: ${message}`,
  };
  console.log("[SOSMailer] Sending SOS email to:", SOS_EMAIL);
  console.log("[SOSMailer] Mail options:", mailOptions);
  try {
    await transporter.sendMail(mailOptions);
    console.log("[SOSMailer] SOS email sent successfully.");
    return true;
  } catch (err) {
    console.error("[SOSMailer] Failed to send SOS email:", err);
    return false;
  }
}
