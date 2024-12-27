import { Schema, model } from "mongoose";

const userSchema = new Schema({
  userID: { type: String },
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  permissions: {type: String},
  secret2fa: {type: String}
});

export const UserModel = model('users', userSchema);