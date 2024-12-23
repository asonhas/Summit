import express from 'express';
import { UserModel } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { SessionModel } from '../models/sessions.model';

const usersRouter = express.Router();

usersRouter.post('/login',async (req,res) => {
    const { user, pass } = req.body;
    if( user != undefined && pass != undefined){
        const data = await UserModel.findOne({ username: user, password: pass });
        console.log('user Id:', data?.userID);
        if(data){
            const sid =  uuidv4();
            res.cookie('sid', sid, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            res.json({ 
                email: data.email,
                username: data.username,
                firstName: data.firstName,
                lastName: data.lastName,
             });
            const newSession = new SessionModel({
                sessionId: sid,
                userId: data.userID as string,
                expiresAt: Date.now() +   24 * 60 * 60 * 1000,
            });
            await newSession.save();
            return;
        }
    }
    res.status(404).send("Bad combination of user and password");
});




export default usersRouter;
