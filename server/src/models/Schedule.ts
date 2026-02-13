import mongoose, { Schema, Document } from "mongoose";

export interface ISchedule extends Document {
  userId: string;
  title: string;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  category: string;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    category: { type: String, required: true },
    memo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISchedule>("Schedule", ScheduleSchema);
