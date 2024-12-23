import express from 'express';
import Utils from '../services/utils.services';
import { TasksModel } from '../models/tasks.model';
import { SessionModel } from '../models/sessions.model';
import { authMiddleware } from '../middlewares/authMiddleware';

const tasksRouter = express.Router();

tasksRouter.put('/saveTask',authMiddleware,async (req,res)=>{
    const { title, description, assignedTo, duedate, priority } = req.body;
    let taskId: string | undefined, isUnique: boolean = false;
    while(!isUnique){
        taskId = Utils.generateTaskId();
        const existingTask = await TasksModel.findOne({ taskId }); 
        if (!existingTask) {
            isUnique = true;
        }
    }
    try {
        const newTask = new TasksModel({
            taskId,
            title,
            description,
            assignedTo,
            duedate,
            priority,
            userID: (req as any).userID,
        });
        await newTask.save();
        res.status(201).json({ message: 'Task saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save task' });
    }
});

tasksRouter.get('',authMiddleware,async (req,res)=>{
    /*
    query tasks to get all tasks where for userID
    */
    try {
        const tasks = await TasksModel.find({ userID: (req as any).userID });
        if (tasks) {
            res.json({ success: true, tasks });
        } else {
            res.json({ success: true, tasks: [] });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred while fetching tasks' });
    }
    
    
});

export default tasksRouter;