import express from 'express';
import { SessionModel } from '../models/sessions.model';

export const authMiddleware: express.RequestHandler = async (req, res, next) => {
    const { username } = req.body;
    if(username){
        const sessionId = req.cookies[`${username}-sid`];
        if (!sessionId) {
            res.status(401).send('Unauthorized! Please login again.');
            return;
        }
        try {
            const session = await SessionModel.findOne({ sessionId });
            if (!session) {
                res.status(401).send('Session expired. Please login again.');
                return;
            }
            (req as any).userID = session.userId; 
            (req as any).userName = session.userName;
            (req as any).permissions = session.permissions;
            next(); 
        } catch (err) {
            console.error('Error fetching session:', err);
            res.status(500).send('Internal server error.');
        }
    }
};