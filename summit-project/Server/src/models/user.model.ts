import { Schema, model } from "mongoose";

const userSchema = new Schema({
  userID: { type: String },
  username: { type: String },
  email: { type: String },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  permissions: {type: String}
});

export const UserModel = model('users', userSchema);