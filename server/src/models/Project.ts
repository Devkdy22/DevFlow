import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: "낮음" | "보통" | "높음";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId, //String → ObjectId
      ref: "User", //User와 관계
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    priority: { type: String, enum: ["낮음", "보통", "높음"], default: "보통" },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
