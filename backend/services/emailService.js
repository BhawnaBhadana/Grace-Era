const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE) === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOrderEmail = async ({ to, orderId, total, items }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("❌ Email skipped: SMTP credentials missing");
    return;
  }

  try {
    const itemsHtml = items
      .map((item) => `<li>${item.name} x ${item.quantity} - INR ${item.unitPrice}</li>`)
      .join("");

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: `Order Confirmation #${orderId}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> ₹${total}</p>
        <p>Thank you for shopping with Grace Era 🌸</p>
      `
    });
    console.log("✅ Email sent:", info.messageId, "to:", to);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

module.exports = { sendOrderEmail };