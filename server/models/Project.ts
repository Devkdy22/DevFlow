import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  status: "planning" | "in-progress" | "completed";
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["planning", "in-progress", "completed"],
    default: "planning",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProject>("Project", ProjectSchema);
