import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  status: "todo" | "doing" | "done";
  dueDate?: Date;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema = new Schema<ITask>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ["todo", "doing", "done"],
    default: "todo",
  },
  dueDate: { type: Date },
  memo: { type: String },
}, { timestamps: true });

export default mongoose.model<ITask>("Task", TaskSchema);
