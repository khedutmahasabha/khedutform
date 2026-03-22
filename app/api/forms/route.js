import dbConnect from "@/utils/dbConnect";
import Submission from "@/models/Submission";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      name,
      phone,
      state,
      district,
      taluka,
      village,
      email,
      surveyNumber,
      totalLand,
      townPlanning,
      pipeline,
      affectedArea,
      compensation,
      farmDamage,
      problem,
    } = body;

    if (
      !name ||
      !phone ||
      !state ||
      !district ||
      !taluka ||
      !village ||
      !email ||
      !surveyNumber ||
      !totalLand ||
      !townPlanning ||
      !pipeline ||
      !compensation ||
      !farmDamage
    ) {
      return Response.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }
    const existing = await Submission.findOne({ email });
    if (existing) {
      return Response.json(
        {
          success: false,
          message: "This email has already been used to submit a form.",
        },
        { status: 409 },
      );
    }
    const submission = await Submission.create({
      name,
      phone,
      email,
      state,
      district,
      taluka,
      village,
      surveyNumber,
      totalLand,
      townPlanning,
      pipeline,
      affectedArea,
      compensation,
      farmDamage,
      problem,
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
