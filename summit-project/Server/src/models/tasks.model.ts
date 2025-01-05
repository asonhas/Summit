import { Schema, model } from "mongoose";

const tasksSchema = new Schema({
    taskId: { type: String },
    title: { type: String },
    description: { type: String },
    assignedTo: { type: String },
    duedate: { type: String },
    priority: {type: String},
    userName: {type: String},
    statusUpdate: [
      {
          username: { type: String, required: true },
          update: { type: String, required: true },
          timestamp: { type: Date, default: Date.now } 
      }
    ]
  });
  
  export const TasksModel = model('tasks', tasksSchema);