import nodemailer from "nodemailer";

export const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { success: false, message: "Invalid email" },
        { status: 400 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 min

    otpStore.set(email, { otp, expiry });

    await transporter.sendMail({
      from: `"Khedut Mahasabha OTP Verify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code · તમારો OTP કોડ",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e8e4df; border-radius: 12px;">
          <h2 style="color: #0f2044; margin-bottom: 8px;">OTP Verification</h2>
          <p style="color: #5c5248; margin-bottom: 24px;">ઓટીપી ચકાસણી · Use this OTP to complete your form submission.</p>
          <div style="background: #fff3ec; border: 2px solid #ff6b1a; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #ff6b1a;">${otp}</p>
          </div>
          <p style="color: #a09890; font-size: 13px;">Valid for 5 minutes · 5 મિનિટ માટે માન્ય</p>
          <p style="color: #a09890; font-size: 13px;">If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    return Response.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return Response.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 },
    );
  }
}
