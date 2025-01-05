import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import Utils from '../services/utils.services';
import { TasksModel } from '../models/tasks.model';
import { teamModel } from '../models/teams.model';
import { eventModel } from '../models/event.model';

const calendarRouter = express.Router();

calendarRouter.post('/',authMiddleware,async (req: any, res: any)=>{
    try {
        const userName: string = (req as any).userName;
        const { currentMonth,  currentYear} = req.body;
        if((!userName || typeof userName !== 'string' || userName.trim() === '')){
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const currentMonthInt = parseInt(currentMonth)
        if (
            isNaN(currentMonthInt) ||
            currentMonthInt < 0 ||
            currentMonthInt > 12
        ) { return res.status(400).json({ message: 'Missing required fields' });}
        const currentYearInt = parseInt(currentYear);
        if (
            isNaN(currentYearInt) ||
            currentYearInt < 1900 ||
            currentYearInt > new Date().getFullYear()
        ){ return res.status(400).json({ message: 'Missing required fields' });}

        
        let filteredUserTasks = [];
        const userTasks = await teamModel.aggregate([
        {
            $match: {
                usersInTeam: { $regex: userName, $options: "i" }, // Match teams where the usersInTeam contains userName
            },
        },
        {
            $lookup: {
                from: "tasks", // The name of the tasks collection in your database
                localField: "teamName", // Field in teamModel to match
                foreignField: "assignedTo", // Field in tasksModel to match
                as: "tasks", // Name of the array to store matched tasks
            },
        },
        {
            $unwind: "$tasks", // Flatten the tasks array for filtering
        },
        {
            $project: {
                _id: 0, // Exclude the MongoDB default _id field
                teamName: 1, // Include teamName
                "tasks.taskId":1,
                "tasks.title": 1, // Include task title
                "tasks.duedate":1,
                "tasks.priority": 1, // Include task priority
            },
        },
        ]);
        const personalEvents = await eventModel.find({ userName, });
        if(userTasks && personalEvents){
            filteredUserTasks = userTasks.filter((task) => String(task.tasks.duedate).includes(`${parseInt(currentMonth)+1}/${currentYear}`));
            
            if(filteredUserTasks){
                return res.json({filteredUserTasks, personalEvents});
            }
        }
        return res.json({ userTasks: [] });
        
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

calendarRouter.put('/',authMiddleware, async (req: any,res: any)=>{
    const { date,  title} = req.body;
    const userName: string = (req as any).userName;
    if((date && String(date).length > 0) && (title && String(title).length > 0)){
        try {
            const newEvent = new eventModel({
                date,
                userName,
                title,
            });
            await newEvent.save();
            res.status(201).json({ message: 'Event saved successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }else{
        return res.status(400).json({ message: 'Missing required fields' });
    }
    
    console.log('date:',date);
    console.log('title:',title);
});

export default calendarRouter;