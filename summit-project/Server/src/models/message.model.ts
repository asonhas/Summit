import { Schema, model } from "mongoose";

const messageSchema = new Schema({
    teamName: { type: String, required: true, unique: true },
    messages: [
      {
        userName: { type: String, required: true },
        message: { type: String, required: true },
        dateSent: { type: Date, required: true, default: Date.now },
      },
    ],
});

export const MessageModel = model('Messages', messageSchema);