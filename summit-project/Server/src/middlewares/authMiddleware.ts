import express from 'express';
import jwt from 'jsonwebtoken';
import { SessionModel } from '../models/sessions.model';

export const authMiddleware: express.RequestHandler = async (req: any, res: any, next) => {
    console.log('in authMiddleware:',req.originalUrl);
    const authorizationHeader = req.headers.authorization;
    if (typeof authorizationHeader == 'string') {
        const token = authorizationHeader.split(' ')?.[1];
        if(token){
            const userdata = jwt.verify(token,process.env.JWTPRIVATEKEY as string)
            if(typeof userdata == 'object'){
                const sessionId = req.cookies[`${userdata.userName}-sid`];
                if (!sessionId) {
                    return res.status(401).send('Unauthorized! Please login again.');
                }
                try {
                    const session = await SessionModel.findOne({ sessionId });
                    if (!session) {
                        return res.status(401).send('Session expired. Please login again.');
                    }
                    (req as any).userID = session.userId; 
                    (req as any).userName = userdata.userName;
                    (req as any).permissions = userdata.permissions;
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