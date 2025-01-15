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
    const [ socket, setSocket ] = useState<Socket | null>(null);
    const [ message, setMessage ] = useState<string | File>('');
    const [ messages, setMessages ] = useState<messageType[]>([]);
    const [ teamName, setTeamName ] = useState<string>('');
    //const videoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

    
// Creating and Sending an Offer
const createOffer = useCallback(async (socket: Socket, peerConnection: RTCPeerConnection, roomId: string)=>{
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send offer to other peer via signaling server
        socket.emit('webrtc-offer', { offer, roomId });
        console.log('Offer sent:', offer);
    } catch (error) {
        console.error('Error creating offer:', error);
    }
},[]);

// Handling and Responding with an Answer
const handleOffer = useCallback(async (socket: Socket,peerConnection: RTCPeerConnection, offer: RTCSessionDescriptionInit, roomId: string)=>{
    console.log('in handleOffer ');
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Send answer back to the other peer via signaling server
        socket.emit('webrtc-answer', { answer, roomId });
        console.log('Answer sent:', answer);
    } catch (error) {
        console.error('Error handling offer and sending answer:', error);
    }
},[]);

// Receiving the Answer
const handleAnswer = useCallback(async (peerConnection: RTCPeerConnection, answer: RTCSessionDescriptionInit)=>{
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        
        console.log('Answer received and set as remote description.');
    } catch (error) {
        console.error('Error handling answer:', error);
    }
},[]);

const shareScreen = useCallback(async (socket: Socket, peerConnection: RTCPeerConnection, roomId: string)=>{
    try {
        // Capture the screen
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
        });

        // Add screen stream to peer connection
        screenStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, screenStream);
        });

        // Create and send offer
        await createOffer(socket, peerConnection, roomId);
        console.log('Screen sharing started.');
    } catch (error) {
        console.error('Error sharing screen:', error);
    }
},[createOffer]);

const displaySharedScreen = useCallback((peerConnection: RTCPeerConnection, videoElement: HTMLVideoElement)=>{
    // Listen for remote stream additions
    peerConnection.ontrack = (event) => {
        // Ensure the remote stream is displayed on the video element
        videoElement.srcObject = event.streams[0];
        console.log('Displaying shared screen.');
    };
},[]);

//const peerConnection = new RTCPeerConnection(); // add useMemo...
const peerConnection = useMemo(()=> {return new RTCPeerConnection()},[]);
const shareScreenBtn = useCallback(()=>{
    // Initialize peer connection
    if(socket){
        shareScreen(socket, peerConnection, teamName);
    }
},[peerConnection, shareScreen, socket, teamName]);


    const startChat = useCallback(async ( Team: string) => {
        if (socket) {
            // Clean up previous socket connection
            socket.off('receiveMessage'); // Remove old listeners
            socket.disconnect();
            console.log('disconnect from room: '+ teamName);
        }
    
        // Establish a new socket connection
        const newSocket = io(`${baseUrl}`, { withCredentials: true });
        setSocket(newSocket);
        if(socket){
            socket.on('connect', () => {
                console.log(`Connected to team room: ${Team}`);
                socket.emit('joinRoom', Team); // Join the room after connecting
            });

            // Listen for incoming messages
            socket.on('receiveMessage', ({ userName, message, dateSent, isFile }: { userName: string, message: string, dateSent: number, isFile: boolean }) => {
                setMessages((prevMessages) => [...prevMessages, { userName, message, dateSent, isFile }]);
            });
            

            socket.on('webrtc-offer', async ({ offer, roomId }) => {
                await handleOffer(newSocket, peerConnection, offer, roomId);
            });
    
            socket.on('webrtc-answer', async ({ answer }) => {
                console.log('webrtc-answer');
                await handleAnswer(peerConnection, answer);
                displaySharedScreen(peerConnection, remoteVideoRef.current as HTMLVideoElement);
            });
    
            
            


            // Cleanup on component unmount
            return () => {
                socket.off('webrtc-offer');
                socket.off('webrtc-answer');
                peerConnection.close();
                newSocket.off('receiveMessage');
                newSocket.disconnect();
                console.log('Disconenct');
            };
        }
        
    }, [displaySharedScreen, handleAnswer, handleOffer, peerConnection, socket, teamName]);
    
    
    const fetchChatMessages = useCallback(async(team: string)=>{
        console.log('2- fetchChatMessages');
        try {
            const result = await axiosClient.get(`/api/chat/${team}`);
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
    },[]);

    const getMessagesAndStartChat = useCallback(async (event: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        const Team = (event.target as HTMLDivElement).innerHTML;
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
        if (socket && message) {
            socket.emit('sendMessage', { 
                message, 
                teamName, 
                userName: user?.userName,
                isFile: false,
            });
            console.log('1- handleSendMessage');
            setMessage('');
            fetchChatMessages(teamName);
        }
    }, [fetchChatMessages, message, socket, teamName, user?.userName]);

    const uploadFile = useCallback(() => {
        Utils.uploadFile().then((file) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            if (socket && reader.result) {
              const fileData = reader.result.toString(); // Ensure the result is a string
      
              // Ensure message.data is being set properly before emitting
              socket.emit('sendMessage', {
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
      }, [fetchChatMessages, socket, teamName, user?.userName]);

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
    },[teamName]);
    
 
    return (
        <div className="chat-container"> 
            {/*<video ref={videoRef}  autoPlay playsInline style={{backgroundColor:'red', width: '400px', maxHeight: '400px', border: '1px solid black' }}></video>
            <video ref={remoteVideoRef}  autoPlay playsInline style={{backgroundColor:'black', width: '400px', maxHeight: '400px', border: '1px solid black' }}></video>*/}
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
                            <img id='share-screen-ico'  className="share-screen-icon" src={shareScreenimg} onClick={ shareScreenBtn }/>
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
