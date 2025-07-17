import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { MessageModel } from '../models/message.model';

const messagesRouter = express.Router();

messagesRouter.get('/:teamName',authMiddleware,async (req: any, res: any)=>{
    const { teamName } = req.params;
    //console.log('teamName',teamName);
    if (!teamName) {
        return res.status(400).json({ message: 'Team name is required' });
    }

    try {
        const result = await MessageModel.findOne({ teamName });

        if (result) {
            //console.log("messages:",result.messages);
            return res.json({ result: result.messages });
        } else {
            return res.status(404).json({ message: 'No messages found for this team' });
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

export default messagesRouter;