import { otpStore } from "../send-otp/route";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    const record = otpStore.get(email);

    if (!record) {
      return Response.json(
        { success: false, message: "OTP not found. Request a new one." },
        { status: 400 },
      );
    }

    if (Date.now() > record.expiry) {
      otpStore.delete(email);
      return Response.json(
        { success: false, message: "OTP expired. Request a new one." },
        { status: 400 },
      );
    }

    if (record.otp !== otp) {
      return Response.json(
        { success: false, message: "Invalid OTP. Try again." },
        { status: 400 },
      );
    }

    otpStore.delete(email);
    return Response.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
