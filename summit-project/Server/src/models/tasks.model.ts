import { Schema, model } from "mongoose";

const tasksSchema = new Schema({
    taskId: { type: String },
    title: { type: String },
    description: { type: String },
    assignedTo: { type: String },
    duedate: { type: String },
    priority: {type: String},
    userID: {type: String},
  });
  
  export const TasksModel = model('tasks', tasksSchema);