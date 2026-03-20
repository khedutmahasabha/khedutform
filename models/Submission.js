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
  },
  { timestamps: true },
);

export default mongoose.models.Submission ||
  mongoose.model("Submission", SubmissionSchema);
