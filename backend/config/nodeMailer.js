import nodemailer from "nodemailer";
import logger from "./logger.js";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, body }) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html: body,
    });
    return response;
  } catch (err) {
    logger.error({ err }, "Error while sending mail");
    throw err; // Re-throw so Inngest retries the step
  }
};

export default sendEmail;
