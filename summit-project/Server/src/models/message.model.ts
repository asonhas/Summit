import { Schema, model } from "mongoose";

const messageSchema = new Schema({
    teamName: { type: String, required: true, unique: true },
    messages: [
      {
        userName: { type: String, required: true, enum: ["text", "file"], },
        message: { type: String, required: true },
        dateSent: { type: Number, require: true },
        path: {type: String, require: true},
        isFile: { type: Boolean, require: true },
      },
    ],
});

export const MessageModel = model('Messages', messageSchema);