import { Schema, model } from "mongoose";

const sessionSchema = new Schema({
    sessionId: { type: String, require: true },
    userId: { type: String, require: true },
    userName: { type: String },
    permissions: {type: String},
    expiresAt: { type: Date, required: true },
});
// TTL Index
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = model('sessions', sessionSchema);