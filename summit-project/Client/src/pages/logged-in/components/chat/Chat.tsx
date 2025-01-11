import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import { useUser } from "../../../../contexts/User-Context";
import './Chat.css';
import { axiosClient } from "../../../../axios";
import Button from "../button-component/Button";
import { baseUrl } from "../../../../axios";
import { io, Socket  } from "socket.io-client";
import axios from "axios";

type messageType ={
    userName: string,
    message: string,
};

function Chat(): ReactNode {
    const { user } = useUser();
    const [ teams, setTeams ] = useState<Array<string>>([]);
    const [ socket, setSocket ] = useState<Socket | null>(null);
    const [ message, setMessage ] = useState<string>('');
    const [ messages, setMessages ] = useState<messageType[]>([]);
    const [ teamName, setTeamName ] = useState<string>('');
    
    useEffect(() => {
        if (user) {
            axiosClient.get(`/api/teams/list-teams/${user?.userName}`)
                .then((result) => {
                    setTeams(result.data.teams);
                });
        }
    }, [user]);
    
    useEffect(()=>{
        const messagesDiv = document.getElementById('messages') as HTMLDivElement;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },[messages.length]);
    const startChat = useCallback(async ( Team: string) => {
        if (socket) {
            // Clean up previous socket connection
            socket.off('receiveMessage'); // Remove old listeners
            socket.disconnect();
        }
    
        // Establish a new socket connection
        const newSocket = io(`${baseUrl}`, { withCredentials: true });
        setSocket(newSocket);
    
        newSocket.on('connect', () => {
            console.log(`Connected to team room: ${Team}`);
            newSocket.emit('joinRoom', Team); // Join the room after connecting
            
        });
    
        // Listen for incoming messages
        newSocket.on('receiveMessage', ({ userName, message }: { userName: string, message: string }) => {
            setMessages((prevMessages) => [...prevMessages, { userName, message }]);
        });

        // Cleanup on component unmount
        return () => {
            newSocket.off('receiveMessage');
            newSocket.disconnect();
            console.log('Disconenct');
        };
    }, [socket]);
    
    const getMessagesAndStartChat = useCallback(async (event: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        const Team = (event.target as HTMLDivElement).innerHTML;
        if (Team === teamName) return; 
        setTeamName(Team); // Set the team name immediately
        // Fetch chat history for the selected team
        try {
            const result = await axiosClient.get(`/api/chat/${Team}`);
            if (result) {
                setMessages(result.data.result);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Handle all errors except 404
                    if (error.response.status !== 404) {
                        console.error("No chat history for this team.. ");
                    }
                }
            }
        }
        console.log('start the chat');
        startChat(Team);
    },[startChat, teamName]);

    const handleSendMessage = useCallback(() => {
        console.log(user?.userName);
        if (socket && message.trim()) {
            socket.emit('sendMessage', { 
                message, 
                teamName, 
                userName: user?.userName 
            });
            setMessage(''); // Clear the input field
        }
    }, [message, socket, teamName, user?.userName]);

    return (
        <div className="chat-container"> 
            <div className="teams">
                {teams.map((team, index) => (
                    <div className="team" key={index} onClick={(event) => getMessagesAndStartChat(event)}>
                        {team}
                    </div>
                ))}
            </div>
            <div className="chat-room">
                <div id='messages' className="messages">
                    {messages.map((msg, index) => (
                        <div className={`messages-msg ${msg.userName == user?.userName ? 'me-message': 'other-message'}`} key={index} style={{alignSelf: msg.userName == user?.userName ? 'flex-start' : undefined}}>
                            { msg.userName == user?.userName ? 
                                <div className="me">{`${msg.userName} :`}</div> 
                                :
                                <div className="other">{`: ${msg.userName}`}</div>
                            }
                            <div className="msg-text" style={{textAlign: msg.userName != user?.userName ?  'right' : undefined}}>{msg.message}</div>
                        </div>
                    ))}
                </div>
                <div className="message-row">
                    <textarea
                        className="message"
                        placeholder="Message.."
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                    />
                    <div className="send-btn">
                        <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                </div>
            </div>
            <div className="chat-files">2</div>
        </div>
    );
}

export default memo(Chat);
