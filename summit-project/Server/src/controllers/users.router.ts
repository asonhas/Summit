import express from 'express';
import { UserModel } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { SessionModel } from '../models/sessions.model';

const usersRouter = express.Router();

usersRouter.post('/login',async (req,res) => {
    const { user, pass } = req.body;
    console.log(user,pass);
    if( user != undefined && pass != undefined){
        const data = await UserModel.findOne({ username: user, password: pass });
        if(data){
            const sid =  uuidv4();
            //res.cookie('sid', sid, { maxAge: 60 * 60 * 1000, httpOnly: true });
            res.cookie('sid', sid, { maxAge: 60 * 1000, httpOnly: true });
            res.json({ 
                email: data.email,
                userName: data.username,
                fName: data.firstName,
                lName: data.lastName,
             });
            const newSession = new SessionModel({
                sessionId: sid,
                userId: data.userId,
               // expiresAt: Date.now() + 60 * 60 * 1000,
               expiresAt: Date.now() +  60 * 1000,
            });
            await newSession.save();
            return;
        }
    }
    res.status(404).send("Bad combination of user and password");
});




export default usersRouter;
