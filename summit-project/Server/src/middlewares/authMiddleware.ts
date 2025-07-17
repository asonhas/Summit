import express from 'express';
import jwt from 'jsonwebtoken';
import { SessionModel } from '../models/sessions.model';

export const authMiddleware: express.RequestHandler = async (req: any, res: any, next) => {
    //console.log('in authMiddleware:',req.originalUrl);  
    const authorizationHeader = req.headers.authorization;
    if (typeof authorizationHeader == 'string') {
        const token = authorizationHeader.split(' ')?.[1];
        if(token){
            const userdata = jwt.verify(token,process.env.JWTPRIVATEKEY as string)
            if(typeof userdata == 'object'){
                let sessionId = req.cookies[`${userdata.userName}-sid`];
                //console.log('Cookie',req.cookies[`${userdata.userName}-sid`]);
                if (!sessionId) {
                    return res.status(401).send('Unauthorized! Please login again.');
                }
                try {
                    const sessionLifetime: number = parseInt(process.env.SESSIONLIFETIME as string);
                    const session = await SessionModel.findOneAndUpdate(
                        { sessionId },
                        { expiresAt: Date.now() + sessionLifetime },
                        { new: true ,upsert: true }
                    );
                    
                    if (!session) {
                        return res.status(401).send('Session expired. Please login again.');
                    }
                    (req as any).userID = session.userId; 
                    (req as any).userName = userdata.userName;
                    (req as any).permissions = userdata.permissions;
                    //console.log('username:',(req as any).userName);
                    
                    res.cookie(`${(req as any).userName}-sid`, sessionId, {
                        maxAge: sessionLifetime,
                        httpOnly: true,
                    });

                    return next(); 
                } catch (err) {
                    res.status(500).send('Internal server error.');
                }
            }else{
                return res.status(401).send('Unauthorized! Please login again.');
            }
        }
    }
    return res.status(401).send('Unauthorized! Please login again.');
};