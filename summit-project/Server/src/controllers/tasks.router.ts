import express from 'express';
import Utils from '../services/utils.services';
import { TasksModel } from '../models/tasks.model';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UserModel } from '../models/user.model';
import { verifyToken } from '../models/auth2fa';

const tasksRouter = express.Router();

tasksRouter.put('/saveTask',authMiddleware,async (req: any, res: any)=>{
    const { title, description, assignedTo, duedate, priority } = req.body;
    let taskId: string | undefined, isUnique: boolean = false;
    while(!isUnique){
        taskId = Utils.generateTaskId('TASK');
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
            userName: (req as any).userName,
            statusUpdate: [],
            status: 'open'
        });
        await newTask.save();
        res.status(201).json({ message: 'Task saved successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

tasksRouter.post('/update/:taskId',authMiddleware,async (req: any, res: any)=>{
    const { taskId } = req.params;
    const { title, description, duedate, priority, status, assignedTo } = req.body;
   
    try {
        const updatedTask = await TasksModel.findOneAndUpdate(
            { taskId }, // Filter
            { title, description, duedate, priority, status, assignedTo }, // Update
            { new: true } // Return the updated document
        );
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.json({
            updatedTask,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

tasksRouter.post('/',authMiddleware,async (req: any,res: any)=>{
    try {
        const userName = (req as any).userName;
        if(userName && typeof userName == 'string'){
            const teams = await Utils.listTeamsForUser(userName);
            const teamNames = teams.map(team => team.teamName);
            const tasks = await TasksModel.find({ assignedTo: { $in: teamNames } });
            if (tasks) {
                res.json({ success: true, tasks });
            } else {
                res.json({ success: true, tasks: [] });
            }
        }else{
            return res.status(400).json({ message: 'Missing required fields' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

tasksRouter.delete('/delete/',authMiddleware,async(req: any, res: any)=>{
    const userPermissions: string = (req as any).permissions as string;
    if(userPermissions == 'administrator'){
        const { taskToDelete, tokentoVerify } = req.body;
        if(taskToDelete && tokentoVerify){
            const user = await UserModel.findOne({ username: (req as any).userName }) // The user who wants to delete the task
            if(user){
                const verifyTokenResult: boolean = verifyToken(user.secret2fa, tokentoVerify);
                if(verifyTokenResult){
                    try {
                        const deletedTask = await TasksModel.findOneAndDelete({ taskId: taskToDelete });
                        if(deletedTask){
                            return res.status(200).json({ message: `Task ${taskToDelete} deleted successfully`});
                        }
                    } catch (error) {
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                }
            }
            return res.status(401).json({ message: 'Token verification failed' });
        }
        return res.status(400).json({ message: 'Missing required fields' });
    }else{
        res.status(403).json({error: 'You do not have permission to perform the requested action.'});
    }
});

tasksRouter.post('/:taskid', authMiddleware, async (req: any, res: any) => {
    const { taskid } = req.params;
    if (taskid) {
        try {
            const task = await TasksModel.findOne({ taskId: taskid });
            if (task) {
                let reversedStatusUpdate: string | any[] | undefined;

                if (Array.isArray(task.statusUpdate)) {
                    // Reverse the array
                    reversedStatusUpdate = [...task.statusUpdate].reverse();
                }

                const filteredTaskFields = {
                    title: task.title,
                    description: task.description,
                    duedate: task.duedate,
                    priority: task.priority,
                    statusUpdate: reversedStatusUpdate,
                    status: task.status,
                    assignedTo: task.assignedTo,
                };

                return res.json({ filteredTaskFields });
            } else {
                return res.json({ filteredTaskFields: {} });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
});



tasksRouter.put('/statusUpdate/',authMiddleware,async (req: any, res: any)=>{
    const { taskId, update } = req.body;
    const userName: string | undefined = (req as any).userName;
    if(taskId && update && userName){
        const statusUpdate = {
            username: userName,
            update,
        };
        
        try {
            const result = await TasksModel.findOneAndUpdate(
                {taskId},
                {
                    $push: { 
                        statusUpdate 
                    } 
                },
                {new: true}
            );
            if(result){
                return res.json({ result: result.statusUpdate, });
            }else{
                res.json({ result: [] });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }else{
        return res.status(400).json({ message: 'Missing required data' });
    }
});

export default tasksRouter;