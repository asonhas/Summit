import express from 'express';
import { SessionModel } from '../models/sessions.model';

export const authMiddleware: express.RequestHandler = async (req, res, next) => {
    const sessionId = req.cookies.sid;
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
        (req as any).userID = session.userId; // Assuming `req.userID` is defined in the extended Request type.
        next(); // Ensures the middleware completes its work and moves to the next handler.
    } catch (err) {
        console.error('Error fetching session:', err);
        res.status(500).send('Internal server error.');
    }
};