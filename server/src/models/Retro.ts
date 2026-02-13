import mongoose, { Schema, Document } from "mongoose";

export interface IRetro extends Document {
  userId: string;
  projectId?: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RetroSchema = new Schema<IRetro>(
  {
    userId: { type: String, required: true },
    projectId: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRetro>("Retro", RetroSchema);
