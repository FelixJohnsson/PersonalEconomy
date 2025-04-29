import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface INote extends mongoose.Document {
  user: IUser["_id"];
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteType {
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
}

export const noteSchema = new mongoose.Schema<INote>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model<INote>("Note", noteSchema);

export default Note;
