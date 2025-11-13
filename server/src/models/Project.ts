import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: "낮음" | "보통" | "높음";
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  priority: { type: String, enum: ["낮음", "보통", "높음"], default: "보통" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProject>("Project", ProjectSchema);
