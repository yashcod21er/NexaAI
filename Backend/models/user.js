import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
