import { memo, ReactNode, useEffect, useState } from "react";
import { useUser } from "../../../../contexts/User-Context";
import './Chat.css';
import { axiosClient } from "../../../../axios";
import Button from "../button-component/Button";

function Chat(): ReactNode{
    const { user } = useUser();
    const [teams, setTeams] = useState<Array<string>>([]);

    useEffect(()=>{
        if(user){
            axiosClient.get(`/api/teams/list-teams/${user?.userName}`)
            .then((result)=>{
                setTeams(result.data.teams);
            });
        }
    },[user]);
    return(
        <div className="chat-container"> 
            <div className="teams">
            {teams.map((team, index)=>(
                <div className="team" key={index}>{team}</div>
            ))}
            </div>
            <div className="chat-room">
                <div className="messages"></div>
                <div className="message-row">
                    <textarea className="message" placeholder="Message.."/>
                    <div className="send-btn">
                        <Button>Send</Button>
                    </div>
                </div>
            </div>
            <div className="chat-files">2</div>
        </div>
    );
}
export default memo(Chat);