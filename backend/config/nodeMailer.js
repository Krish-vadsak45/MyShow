import nodemailer from "nodemailer";
import logger from "./logger.js";
import { emailBreaker } from "./circuitBreakers.js";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000, // 5s connection timeout
  greetingTimeout: 5000,   // 5s greeting timeout
  socketTimeout: 8000,     // 8s socket timeout
});

const sendEmail = async ({ to, subject, body, html }) => {
  try {
    const response = await emailBreaker.fire(async () => {
      return await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html: html || body,
      });
    });
    return response;
  } catch (err) {
    logger.error(
      { err: err?.message, to, subject },
      "Error or breaker open while sending mail via Brevo SMTP",
    );
    throw err; // Re-throw so Inngest can checkpoint or retry cleanly
  }
};

export default sendEmail;
