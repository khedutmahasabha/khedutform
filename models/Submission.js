import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      default: "Gujarat",
    },
    district: {
      type: String,
      required: [true, "District is required"],
    },
    taluka: {
      type: String,
      required: [true, "Taluka is required"],
    },
    village: {
      type: String,
      required: [true, "Village is required"],
    },
    surveyNumber: { type: String, required: true, trim: true },
    totalLand: { type: String, required: true },
    townPlanning: { type: String, required: true, enum: ["yes", "no"] },
    pipeline: { type: String, required: true },
    affectedArea: { type: String, default: "" },
    compensation: {
      type: String,
      required: true,
      enum: ["yes", "no", "partially"],
    },
    farmDamage: { type: String, required: true, enum: ["yes", "no"] },
    problem: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Submission ||
  mongoose.model("Submission", SubmissionSchema);
