import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // super-admin, admin, end-user
    },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
    isSystemRole: {
      type: Boolean,
      default: false, // protect core roles
    },
  },
  { timestamps: true },
);

export default mongoose.model("Role", roleSchema);
