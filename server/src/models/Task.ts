import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask extends Document {
  projectId: Types.ObjectId;
  title: string;
  status: "할 일" | "진행 중" | "완료";
  dueDate: Date;
}

const TaskSchema = new Schema<ITask>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ["할 일", "진행 중", "완료"],
    default: "할 일",
  },
  dueDate: { type: Date },
});

export default mongoose.model<ITask>("Task", TaskSchema);
