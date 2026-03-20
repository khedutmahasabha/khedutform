import dbConnect from "@/utils/dbConnect";
import Submission from "@/models/Submission";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { name, phone, state, district, taluka, village } = body;

    if (!name || !phone || !state || !district || !taluka || !village) {
      return Response.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const submission = await Submission.create({
      name,
      phone,
      state,
      district,
      taluka,
      village,
    });

    return Response.json({ success: true, data: submission }, { status: 201 });
  } catch (error) {
    console.error("Submission error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const submissions = await Submission.find({}).sort({ createdAt: -1 });
    return Response.json({ success: true, data: submissions }, { status: 200 });
  } catch (error) {
    console.error("Fetch error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
