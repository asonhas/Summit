import express from 'express';
import { UserModel } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

const usersRouter = express.Router();

usersRouter.post('/login',async (req,res) => {
    const { user, pass } = req.body;
    console.log(user,pass);
    if( user != undefined && pass != undefined){
        const data = await UserModel.findOne({ username: user, password: pass });
        if(data){
            const sid =  uuidv4();
            res.cookie('sid', sid, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            console.log('Cookie is send');
            res.json({ message: 'Login successful' });
            return;
        }
    }
    res.status(404).send("Bad combination of user and password");
});




export default usersRouter;
