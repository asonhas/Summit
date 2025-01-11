import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import { useUser } from "../../../../contexts/User-Context";
import './Chat.css';
import { axiosClient } from "../../../../axios";
import Button from "../button-component/Button";
import { baseUrl } from "../../../../axios";
import { io, Socket  } from "socket.io-client";

function Chat(): ReactNode {
    const { user } = useUser();
    const [teams, setTeams] = useState<Array<string>>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [teamName, setTeamName] = useState<string>('');

    useEffect(() => {
        if (user) {
            axiosClient.get(`/api/teams/list-teams/${user?.userName}`)
                .then((result) => {
                    setTeams(result.data.teams);
                });
        }
    }, [user]);

    const startChat = useCallback(async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const Team = (event.target as HTMLDivElement).innerHTML;
        setTeamName(Team); // Set the team name immediately

        if(socket){
            socket.disconnect();
            setMessages([]);
        }

        // Establish a socket connection when the team is selected
        const newSocket = io(`${baseUrl}`, { withCredentials: true });
        setSocket(newSocket);

        // Wait until the socket is connected before joining the room
        newSocket.on('connect', () => {
            newSocket.emit('joinRoom', Team); // Now join the room after socket is connected
        });

        // Listen for incoming messages
        newSocket.on('receiveMessage', (message: string) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
    }, [socket]);

    const handleSendMessage = useCallback(() => {
        console.log(user?.userName);
        if (socket && message.trim()) {
            socket.emit('sendMessage', message, teamName, user?.userName); // Send message to server
            setMessage(''); // Clear the input field
        }
    }, [message, socket, teamName, user?.userName]);

    return (
        <div className="chat-container"> 
            <div className="teams">
                {teams.map((team, index) => (
                    <div className="team" key={index} onClick={(event) => startChat(event)}>
                        {team}
                    </div>
                ))}
            </div>
            <div className="chat-room">
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div className="messages-msg" key={index} style={{alignSelf: String(msg).includes(user?.userName as string) ? 'flex-start' : undefined}}>
                            {msg}
                        
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
