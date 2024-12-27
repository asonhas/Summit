import express from 'express';
import { UserModel } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { SessionModel } from '../models/sessions.model';
import { authMiddleware } from '../middlewares/authMiddleware';
import { generateSecret , generateQRCode, verifyToken } from '../models/auth2fa';
import bcrypt from 'bcrypt';

const usersRouter = express.Router();

usersRouter.post('/login',async (req: any,res: any) => {
    const { user, pass } = req.body;
    if( user != undefined && pass != undefined){
        let data;
        try {
            data = await UserModel.findOne({ username: user });  
        } catch (error) {
            return res.status(500).send({ error: 'Internal server error.' });
        }
        if(data && typeof data.password == 'string'){
            let passwordVerified: boolean;
            try {
                passwordVerified = await bcrypt.compare(pass,(data.password));
            } catch (error) {
                return res.status(500).send({ error: 'Internal server error.' });
            }
            if(passwordVerified){
                const sid =  uuidv4();
                res.cookie(`${data.username}-sid`, sid, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                // JWT
                res.json({ 
                    email: data.email,
                    userName: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    permissions: data.permissions,
                 });
                const newSession = new SessionModel({
                    sessionId: sid,
                    userId: data.userID as string,
                    userName: data.username as string,
                    permissions: data.permissions as string,
                    expiresAt: Date.now() +   24 * 60 * 60 * 1000,
                });
                return await newSession.save();
            }
        }
    }
    res.status(404).send("Bad combination of user and password");
});



usersRouter.post('/',authMiddleware,async (req: any,res: any)=>{
    try {
        if(String((req as any).permissions) == 'administrator'){
            const users = await UserModel.find();
            if(users){
                const usersData = users.map((user) => {
                    return({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        userName: user.username,
                        permissions: user.permissions,
                    });
                });
                res.json({ success: true, usersData });
            } else {
                res.json({ success: true, usersData: [] });
            }
        }else{
            return res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred while fetching users' });
    }
});


const saveUser = async (req: any, res: any, next: any) => {
    const { firstName, lastName, newusername, email, password, permissions } = req.body;
    if(String(firstName).length == 0 || String(lastName).length == 0 || String(newusername).length == 0 || String(email).length == 0 || String(password).length == 0 && String(permissions).length == 0){
        return res.status(400).send({ error: 'All fields are required.' });
    }

    const SaltRounds: number | undefined = (() => {
        const sr = process.env.SALTROUNDS;
        if (!sr) {
            return undefined;
        }
        return parseInt(sr, 10);
    })();
    if(typeof SaltRounds == 'undefined'){
        return res.status(500).send({ error: 'Internal server error.' });
    }
    let hashedPassword: string;
    try {
        hashedPassword = await bcrypt.hash(password,SaltRounds);
    } catch (error) {
        return res.status(500).send({ error: 'Internal server error.' }); 
    }

    try {
        const userID = uuidv4();
        //const permissions = 'regular';

        const newUser = new UserModel({
            email,
            username: newusername,
            password: hashedPassword,
            permissions,
            firstName,
            lastName,
            userID,
            secret2fa: '',
        });
        await newUser.save();
        (req as any).userId = userID;
        next();
    } catch (error: any) {
        if(error.code === 11000){
            // MongoDB Duplicate Key Error
            const field = Object.keys(error.keyPattern)[0]; // Get the field causing the error
            return res.status(409).send({ error: `Duplicate ${field}.` });
        }
        return res.status(500).send({ error: 'Internal server error.' });
    }
}

usersRouter.put('/adduser',authMiddleware,saveUser,async (req: any,res: any)=>{
    try {
        const secret = generateSecret(`Sammit`);
        const qrCode = await generateQRCode(secret.otpauth_url as string);
        const updatedUser = await UserModel.findOneAndUpdate(
            {userID: (req as any).userId},
            {$set: {secret2fa: secret.base32} }
        );
        if(!updatedUser){
            return res.status(404).json({ message: 'User not found or no changes made' });
        }
        
        res.status(200).json({
          qrCode,
        });
      } catch (error) {
        res.status(500).json({ message: 'adduser Error generating QR code ' });
      }
});

usersRouter.delete('/delete/:username',authMiddleware,async(req,res)=>{
    const userPermissions: string = (req as any).permissions as string;
    if(typeof userPermissions == 'string' && userPermissions == 'administrator'){
        const user = req.params.username;
        try {
            const deletedUser = await UserModel.findOneAndDelete({username: user});    
            if (deletedUser) {
                res.status(200).json({ message: 'User deleted successfully'});
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
        
    }else{
        res.status(403).json({error: 'You do not have permission to perform the requested action.'});
    }
});

export default usersRouter;
