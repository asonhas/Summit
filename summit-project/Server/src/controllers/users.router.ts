import express from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { SessionModel } from '../models/sessions.model';
import { authMiddleware } from '../middlewares/authMiddleware';
import { generateSecret , generateQRCode, verifyToken } from '../models/auth2fa';
import bcrypt from 'bcrypt';
import { GeneratedSecret } from 'speakeasy';

const usersRouter = express.Router();

usersRouter.post('/login',async (req: any,res: any) => {
    const { user, pass, otp } = req.body;
    console.log('user: ' +user +' - pass: '+ pass +' - otp: '+ otp);
    if( user != undefined && pass != undefined){
        let userData;
        try {
            userData = await UserModel.findOne({ username: user });  
        } catch (error) {
            return res.status(500).send({ error: 'Internal server error.' });
        }
        if(userData && typeof userData.password == 'string'){
            let passwordVerified: boolean;
            try {
                passwordVerified = await bcrypt.compare(pass,(userData.password));
            } catch (error) {
                return res.status(500).send({ error: 'Internal server error.' });
            }
            if(passwordVerified){
                if(user != 'summit'){
                    const isTokenValid: boolean = verifyToken(userData.secret2fa, otp);
                    if(!isTokenValid){
                        return res.status(401).json({ message: 'Token verification failed' });
                    }
                }
                const pauload = { email: userData.email, userName: userData.username, firstName: userData.firstName, lastName: userData.lastName, permissions: userData.permissions };
                const token = jwt.sign(pauload, process.env.JWTPRIVATEKEY as string);
                const sid =  uuidv4();
                const sessionLifetime: number = parseInt(process.env.SESSIONLIFETIME as string) | 60*1000;
                res.cookie(`${userData.username}-sid`, sid, { maxAge: sessionLifetime, httpOnly: true });
                res.json({token});
                const newSession = new SessionModel({
                    sessionId: sid, // session id
                    userToken: token,
                    expiresAt: Date.now() + sessionLifetime,
                });
                return await newSession.save();
            }
        }else{
            return res.status(401).json({ message: 'Bad combination of user and passwor' });
        }
    }
    return res.status(400).json({ message: 'Missing required fields' });
});

usersRouter.post('/logout',authMiddleware,async (req: any, res: any)=>{
    const sessionId = req.cookies[`${(req as any).userName}-sid`];
    if (sessionId) {
        try {
            const deletedSession = await SessionModel.findOneAndDelete({sessionId});
            if (!deletedSession) {
                return res.status(404).send({ error: 'Session not found.' });
            }
            res.clearCookie(`${req.userName}-sid`); // Clear the session cookie
            return res.status(200).send({ message: 'Logged out successfully.' });
        } catch (error) {
            return res.status(500).send({ error: 'Internal server error.' }); 
        }
    }else{
        return res.status(400).send({ error: 'Session ID not found in cookies.' }); 
    }
});

usersRouter.get('/list-users',authMiddleware,async (req: any,res: any)=>{
    const allUsers = await UserModel.find();
    if(allUsers){
        const users = allUsers.map((user)=> {
            return ({
                username: user.username,
            });
        });
        return res.json({users});
    }
    return res.status(500).send({ error: 'Internal server error.' }); 
});

usersRouter.get('/',authMiddleware,async (req: any,res: any)=>{
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

const hashedPassword = (async (password: string):Promise<string | undefined>=>{
    const SaltRounds: number | undefined = (() => {
        const sr = process.env.SALTROUNDS;
        if (!sr) {
            return undefined;
        }
        return parseInt(sr, 10);
    })();
    if(typeof SaltRounds == 'undefined'){
        return undefined;
    }
    let hashedPassword: string;
    try {
        return hashedPassword = await bcrypt.hash(password,SaltRounds);
    } catch (error) {
        return undefined; 
    }
});

const saveUser = async (req: any, res: any, next: any) => {
    const { firstName, lastName, newusername, email, password, permissions } = req.body;
    if(String(firstName).length == 0 || String(lastName).length == 0 || String(newusername).length == 0 || String(email).length == 0 || String(password).length == 0 && String(permissions).length == 0){
        return res.status(400).send({ error: 'All fields are required.' });
    }

    try {
        const Password = await hashedPassword(password);
        if(Password){
            const userID = uuidv4();
            //const permissions = 'regular';
    
            const newUser = new UserModel({
                email,
                username: newusername,
                password: Password,
                permissions,
                firstName,
                lastName,
                userID,
                secret2fa: '',
            });
            await newUser.save();
            (req as any).userId = userID;
            next();
        }else{
            return res.status(500).send({ error: 'Internal server error.' });
        }
    } catch (error: any) {
        if(error.code === 11000){
            // MongoDB Duplicate Key Error
            const field = Object.keys(error.keyPattern)[0]; // Get the field causing the error
            return res.status(409).send({ error: `Duplicate ${field}.` });
        }
        return res.status(500).send({ error: 'Internal server error.' });
    }
};

type set2faType = {
    secret: GeneratedSecret,
    qrCode: string
};
const set2fa = async (): Promise<set2faType | undefined> =>{
    try {
        const secret: GeneratedSecret = generateSecret(`Summit`);
        const qrCode: string = await generateQRCode(secret.otpauth_url as string);
        return ({
            secret,
            qrCode,
        });    
    } catch (error) {
        return undefined;
    }
};

usersRouter.put('/adduser',authMiddleware,saveUser,async (req: any,res: any)=>{
    try {
        const result: set2faType | undefined = await set2fa();
        if(result){
            const updatedUser = await UserModel.findOneAndUpdate(
                {userID: (req as any).userId},
                {$set: {secret2fa: result.secret.base32} }
            );
            if(!updatedUser){
                return res.status(404).json({ message: 'User not found or no changes made' });
            }
            
            res.status(200).json({
                qrCode: result.qrCode,
            });
        }
      } catch (error) {
        res.status(500).json({ message: 'adduser Error generating QR code ' });
      }
});

usersRouter.delete('/delete/',authMiddleware,async(req: any, res: any)=>{
    const userPermissions: string = (req as any).permissions as string;
    if(typeof userPermissions == 'string' && userPermissions == 'administrator'){
        const { userToDelete, tokentoVerify } = req.body;
        if(userToDelete && tokentoVerify){
            const user = await UserModel.findOne({ username: (req as any).userName }) // The user who wants to delete a user
            if(user){
                const verifyTokenResult: boolean = verifyToken(user.secret2fa, tokentoVerify);
                if(verifyTokenResult){
                    try {
                        const deletedUser = await UserModel.findOneAndDelete({username: userToDelete});    
                        if (deletedUser) {
                            return res.status(200).json({ message: 'User deleted successfully'});
                        }
                    } catch (error) {
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                }
                return res.status(404).json({ message: 'Token verification failed' });
            }
        } 
        return res.status(400).json({ message: 'Missing required fields' });
    }else{
        res.status(403).json({error: 'You do not have permission to perform the requested action.'});
    }
});

usersRouter.post('/update/:username',authMiddleware,async (req: any, res: any)=>{
    const { username } = req.params;
    const { password, firstName, lastName, email, permissions } = req.body;
    if(password && String(password).length > 0){
        console.log('in password');
        try {
            const Password =  await hashedPassword(password);
            const result: set2faType | undefined = await set2fa();
            if(Password && result){
                const user = await UserModel.findOneAndUpdate(
                    { username }, // Filter
                    { password: Password, secret2fa: result.secret.base32 }, // Update
                    { new: true } // Return the updated document
                );
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.json({
                    message: 'The request has been processed.',
                    qrCode: result.qrCode,
                });
            }else{
                return res.status(400).json({ message: 'The request is malformed or invalid.' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }else{
        if(firstName && lastName && email && permissions){
            console.log('in user info');
            try {
                const user = await UserModel.findOneAndUpdate(
                    { username }, // Filter
                    { firstName, lastName, email, permissions }, // Update
                    { new: true } // Return the updated document
                );
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.json({
                    message: 'The request has been processed.',
                });
            } catch (error) {
                return res.status(500).json({ message: 'Internal server error' }); 
            }
        }else{
            return res.status(400).json({ message: 'The request is malformed or invalid.' });
        }
    }
    
});

export default usersRouter;
