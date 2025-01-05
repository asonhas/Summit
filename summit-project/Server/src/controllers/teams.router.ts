import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import Utils from '../services/utils.services';
import { teamModel } from '../models/teams.model';
import tasksRouter from './tasks.router';
import { TasksModel } from '../models/tasks.model';
import { UserModel } from '../models/user.model';
import { verifyToken } from '../models/auth2fa';

const teamsRouter = express.Router();

teamsRouter.put('/saveTeam', authMiddleware, async (req: any, res: any)=>{
    const userPermissions: string = (req as any).permissions as string;
    if(typeof userPermissions == 'string' && userPermissions != 'administrator'){
        return res.status(403).json({error: 'You do not have permission to perform the requested action.'});
    }
    const { teamName, teamTitle, usersInTeam } = req.body;
    if(String(teamName).length == 0 || String(teamTitle).length == 0 || String(usersInTeam).length == 0){
        return res.status(400).send({ error: 'All fields are required.' });
    }
    let teamId: string | undefined, isUnique: boolean = false;
    while(!isUnique){
        teamId = Utils.generateTaskId('TEAM');
        const existingTeam = await teamModel.findOne({ teamId }); 
        if (!existingTeam) {
            isUnique = true;
        }
    }
    try {
        const newTeam = new teamModel({
            teamId,
            teamName,
            teamTitle,
            usersInTeam,
        });
        await newTeam.save();
        res.status(201).json({ message: 'Team saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

teamsRouter.post('/',authMiddleware, async (req: any,res: any)=>{
    try {
        const teams = await teamModel.find();
        if (teams) {
            res.json({ success: true, teams });
        } else {
            res.json({ success: true, teams: [] });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

teamsRouter.post('/list-teams',authMiddleware,async (res: any,req: any)=>{
    try {
        // Find all teams and return only the teamName field
        const allTeams = await teamModel.find({}, { teamName: 1, _id: 0 });
        const teams = allTeams.map(team => team.teamName);
        if(teams){
            return req.json({teams,});
        }else{
            return req.json({teams: []});
        }
        
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

teamsRouter.delete('/delete/',authMiddleware,async(req: any, res: any)=>{
    const userPermissions: string = (req as any).permissions as string;
    if(typeof userPermissions == 'string' && userPermissions == 'administrator'){
        const { teamToDelete ,tokentoVerify } = req.body;
        if(teamToDelete && tokentoVerify){
            const user = await UserModel.findOne({ username: (req as any).userName }) // The user who wants to delete the team
            if(user){
                const verifyTokenResult: boolean = verifyToken(user.secret2fa, tokentoVerify);
                if(verifyTokenResult){
                    try {
                        const team = await teamModel.findOneAndDelete({ teamId: teamToDelete });
                        if (team) {
                            return res.status(200).json({ message: 'User deleted successfully'});
                        }
                    } catch (error) {
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                }
                return res.status(401).json({ message: 'Token verification failed' });
            }
            return res.status(500).json({ message: 'Internal server error' });
        }else{
            return res.status(400).json({ message: 'Missing required fields' });
        }

    }else{
        res.status(403).json({error: 'You do not have permission to perform the requested action.'});
    }
    
});

export default teamsRouter;