import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../../../../contexts/User-Context";
import './Chat.css';
import { axiosClient } from "../../../../axios";
import Button from "../button-component/Button";
import { baseUrl } from "../../../../axios";
import { io, Socket  } from "socket.io-client";
import axios from "axios";
import Attachment from '../../../../assets/Attachment.png'
import shareScreenimg from '../../../../assets/shareScreen.png';
import Utils from "../../../../utils/Utils";

type messageType ={
    userName: string,
    message: string | File,
    dateSent: number,
    isFile: boolean,
};


function Chat(): ReactNode {
    const { user } = useUser();
    const [ teams, setTeams ] = useState<Array<string>>([]);
    //const [ socket, setSocket ] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [ message, setMessage ] = useState<string | File>('');
    const [ messages, setMessages ] = useState<messageType[]>([]);
    const [ teamName, setTeamName ] = useState<string>('');
    const isFirstTimeChatOpen = useRef<boolean>(true);
    const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    

    
    const startChat = useCallback(async (Team: string) => {
        console.log('startChat:', Team);
        socketRef.current?.disconnect();
        // יצירת socket חדש
        socketRef.current = io(`${baseUrl}`, { withCredentials: true });
        
        socketRef.current?.on('connect', () => {
            console.log('socket connected:', socketRef.current?.id);
            //console.log(`Connected to team room: ${Team}`);
            socketRef.current?.emit('joinRoom', Team);
            
            // the socketIo server will call this function when a new message is received
            // and it will update the messages state
            socketRef.current?.on('receiveMessage', ({ userName, message, dateSent, isFile }) => {
                //console.log('receiveMessage');
                setMessages((prevMessages) => [...prevMessages, { userName, message, dateSent, isFile }]);
            });

            
        });


        // ניקוי בעת סגירה
        return () => {
            socketRef.current?.off('receiveMessage');
            socketRef.current?.disconnect();
        };
    }, []);


    
    useEffect(() => {
        if (user) {
            axiosClient.get(`/api/teams/list-teams/${user?.userName}`)
            .then((result) => {
                setTeams(result.data.teams);
            });
        }
    }, [user]);
    
    // Scroll to the bottom of the messages div when messages change
    // This effect will run whenever the messages array changes
    useEffect(()=>{
        const messagesDiv = document.getElementById('messages') as HTMLDivElement;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },[messages.length]);


    // start new code...
    const startSharing = useCallback(async ()=>{
        // Initialize peer connection
        console.log('startSharing  called', socketRef.current?.id);
        if(socketRef.current){
            
        }
    },[]);


    

    
    const fetchChatMessages = useCallback(async(team: string)=>{
        //console.log('2- fetchChatMessages');
        try {
            const result = await axiosClient.get(`/api/chat/${team}`);
            if (result) {
                setMessages(result.data.result);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Handle all errors except 404
                    if (error.response.status == 404) {
                        (`No chat history for ${team} team.. `);
                    }
                }
            }
        }
    },[]);

    const getMessagesAndStartChat = useCallback(async (event: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        const messagesDiv = document.getElementById('messages-area') as HTMLDivElement;
        const Team = (event.target as HTMLDivElement).innerHTML;
        if(messagesDiv != null && Team !== teamName) {
            messagesDiv.innerHTML = '';
            setMessages([]); // Clear messages state
        } 
        
        if (Team === teamName) return; 
        setTeamName(Team); // Set the team name immediately
        // Fetch chat history for the selected team
        await fetchChatMessages(Team);
        (document.getElementById('message') as HTMLTextAreaElement).readOnly = false;
        (document.getElementById('Attachment-icon') as HTMLImageElement).style.pointerEvents = 'auto';
        (document.getElementById('share-screen-ico') as HTMLImageElement).style.pointerEvents = 'auto';
        
        startChat(Team);
    },[fetchChatMessages, startChat, teamName]);

    const handleSendMessage = useCallback(() => {
        if (socketRef.current && message) {
            socketRef.current.emit('sendMessage', { 
                message, 
                teamName, 
                userName: user?.userName,
                isFile: false,
            });
            //console.log('1- handleSendMessage');
            setMessage('');
            fetchChatMessages(teamName);
        }
    }, [fetchChatMessages, message, socketRef.current, teamName, user?.userName]);

    const uploadFile = useCallback(() => {
        Utils.uploadFile().then((file) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            if (socketRef.current && reader.result) {
              const fileData = reader.result.toString(); // Ensure the result is a string
      
              // Ensure message.data is being set properly before emitting
              socketRef.current.emit('sendMessage', {
                message: {
                  name: file.name,
                  type: file.type,
                  data: fileData, // Send the base64 data here
                },
                teamName,
                userName: user?.userName,
              });
            }
          };
          fetchChatMessages(teamName);
        }).catch(() => {});
      }, [fetchChatMessages, socketRef.current, teamName, user?.userName]);

    const downloadFile = useCallback(async (element: React.MouseEvent<HTMLSpanElement, MouseEvent>)=>{
        const parentElement = element.currentTarget.parentElement?.parentElement as HTMLDivElement;
        const childDivs = parentElement.querySelectorAll('div') as NodeListOf<HTMLDivElement>;
        let filePath = `${baseUrl}/uploads/${teamName}/`;
        filePath +=String(Utils.getTimestamp(childDivs[2].innerText) / 1000);
        filePath += '-'+element.currentTarget.innerText;
        // Map file extensions to MIME types
        const mimeTypes: { [key: string]: string } = {
            '.txt': 'text/plain',
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.csv': 'text/csv',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };

        const fileName = element.currentTarget.innerText.trim();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.')); // Get the file extension

        const mimeType = mimeTypes[fileExtension] || 'application/octet-stream'; // Default to binary if no match

        try {
            const response = await axiosClient.get(filePath, {
                responseType: 'blob', // Important for handling binary data
            });

            if (response) {
                const blob = new Blob([response.data], { type: mimeType });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = fileName; // Ensure proper file extension
                document.body.appendChild(a);
                a.click();

                // Cleanup
                a.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    },[teamName,messages.length]);
    
    useEffect(() =>{
        if(teams.length >0 && isFirstTimeChatOpen.current){
            // Automatically join the first team in the list
            const firstTeam = teams[0];
            setTeamName(firstTeam);
            fetchChatMessages(firstTeam);
            startChat(firstTeam);
            (document.getElementById('message') as HTMLTextAreaElement).readOnly = false;
            (document.getElementById('Attachment-icon') as HTMLImageElement).style.pointerEvents = 'auto';
            (document.getElementById('share-screen-ico') as HTMLImageElement).style.pointerEvents = 'auto';
            isFirstTimeChatOpen.current = false; // Set to false after the first time
        }
    },[teams.length]);
 
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
                        <div id='messages-area' className={`messages-msg ${msg.userName == user?.userName ? 'me-message': 'other-message'}`} key={index} style={{alignSelf: msg.userName == user?.userName ? 'flex-start' : undefined}}>
                            { msg.userName == user?.userName ? 
                                <div className="me">{`${msg.userName} :`}</div> 
                                :
                                <div className="other">{`: ${msg.userName}`}</div>
                            }
                            
                            <div className="msg-text" style={{textAlign: msg.userName != user?.userName ?  'right' : undefined}}> 
                            {
                                msg.isFile === false ? 
                                msg.message as string
                                :
                                <span className="link" onClick={(element)=>downloadFile(element)}>{msg.message as string} </span>
                            }
                            </div>
                            <div>{Utils.formatDate(msg.dateSent)}</div>
                        </div>
                    ))}
                </div>
                <div className="message-row">
                    <textarea
                        id= 'message'
                        className="message"
                        placeholder="Message.."
                        value={ typeof message === 'string' ? message as string : message.name}
                        onChange={(event) => setMessage(event.target.value)}
                        readOnly = {true}
                    />
                    <div className="send-btn">
                        <div>
                            <img id='share-screen-ico'  className="share-screen-icon" src={shareScreenimg} onClick={ startSharing }/>
                            <img id='Attachment-icon' className="Attachment-icon" src={Attachment} onClick={uploadFile}/>
                        </div>
                        <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                </div>
            </div>
           
        </div>
    );
}

export default memo(Chat);