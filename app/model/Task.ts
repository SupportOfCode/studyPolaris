import mongoose, { Schema, Document } from "mongoose";

interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: string;
  tags?: string;
  status: string;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    priority: { type: String, required: true },
    tags: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("Task", TaskSchema);
