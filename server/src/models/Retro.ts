import mongoose, { Schema, Document } from "mongoose";

export interface IRetro extends Document {
  userId: string;
  projectId: string;
  content: string;
  createdAt: Date;
}

const RetroSchema = new Schema<IRetro>({
  userId: { type: String, required: true },
  projectId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRetro>("Retro", RetroSchema);
