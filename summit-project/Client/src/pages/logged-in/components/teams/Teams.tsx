import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import AddTeam from "./add-team/AddTeam";
import { teamInfoType, teamType } from "../../../../types/Types";
import refreshIcon from '../../../../assets/refresh-icon.png';
import deleteIcon from '../../../../assets/close-task.png';
import './Teams.css';
import { axiosClient } from "../../../../axios";
import Utils from "../../../../utils/Utils";
import axios from "axios";
import EditTeam from "./edit-team/EditTeam";
import { useUser } from "../../../../contexts/User-Context";

interface teamsProps {
    setCustomComponent: (component: ReactNode | null) => void;
}

function Teams({ setCustomComponent }: teamsProps): ReactNode{
    const { user } = useUser();
    const [showAddTeam, setShowAddTeam] = useState<boolean>(false);
    const [teamsArr, setTeamsArr] = useState<Array<teamType>>([]);

    useEffect(()=>{
        const deleteIcons = document.querySelectorAll('.delete-user') as NodeListOf<Element>;
        deleteIcons.forEach((deleteIcon) => {
            deleteIcon.addEventListener('mouseenter', function() {
                const parentDiv = deleteIcon.parentElement as HTMLElement | null; 
                if (parentDiv) {
                    const spanElements = Array.from(parentDiv.querySelectorAll('span'));
                    spanElements.forEach((spanElement)=> {
                        spanElement.style.textDecoration = 'line-through';
                        spanElement.style.color = 'red';
                    });
                }
            });
        
            deleteIcon.addEventListener('mouseleave', function() {
                const parentDiv = deleteIcon.parentElement as HTMLElement | null;
                if (parentDiv) {
                    const spanElements = Array.from(parentDiv.querySelectorAll('span'));
                    spanElements.forEach((spanElement)=> {
                        spanElement.style.textDecoration = '';
                        spanElement.style.color = 'black';
                    });
                }
            });
        });


        if(teamsArr.length == 0){
            try {
                axiosClient.post('/api/teams/').then((response)=>{
                    if(response.data){
                        setTeamsArr(response.data.teams);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    },[teamsArr.length]);

    const handleCreateTaskClick = useCallback(()=>{
        setShowAddTeam(true);
    },[]);

    const handleRefresh = useCallback(()=>{
        setTeamsArr([]);
    },[]);

    const handleDeleteTeam = useCallback(async (event: React.MouseEvent<HTMLImageElement>)=>{
        if(user && user.permissions == 'administrator'){
            const parentElement = event.currentTarget.parentElement as HTMLDivElement;
            if(parentElement){
                const spanElements = Array.from(parentElement.querySelectorAll('span'));
                if(spanElements){
                    const teamToDelete = spanElements[0].innerText;
                    if(typeof teamToDelete == 'string' && teamToDelete.length >0){
                        Utils.customAlert2Fa().then(async (result) => {
                            if (result.isConfirmed) {
                                try {
                                    const response = await axiosClient.delete('/api/teams/delete',{
                                        data: { teamToDelete, tokentoVerify: result.value},
                                    });
                                    if (response && response.status === 200) {
                                        Utils.customAlert('Delete team',`Team ${teamToDelete} is successfuly deleted`,'success','OK');
                                        setTeamsArr([]); 
                                    }
                                } catch (error) {
                                    if(axios.isAxiosError(error)){
                                        if(error.response){
                                            if (error.response.status === 401) {
                                                return Utils.customAlert('Delete user','Token verification failed.','error','OK');        
                                            } 
                                            if (error.response.status === 400) {
                                                return Utils.customAlert('Delete user','Missing required fields.','error','OK');        
                                            }
                                            if(error.response?.status === 403){
                                                return Utils.customAlert('Delete Team','You do not have permission to perform the requested action','error','OK');
                                            }
                                        }
                                    }
                                }
                            }
                        });   
                    }
                }
            }
        }else{
            Utils.customAlert('Delete Team','You do not have the necessary permissions to delete this team. Please contact your team administrator','info','OK');
        }
    },[user]);

    const handleEditTeam = useCallback((event: React.MouseEvent<HTMLDivElement>)=>{
        const row = (event.target as HTMLElement).parentElement;
        if(row){
            const teamRow = row.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
            const teamInfo: teamInfoType = {
                teamId: teamRow[0].innerText,
                teamName: teamRow[1].innerText,
                teamDescription: teamRow[2].innerText,
                teamMembers: teamRow[3].innerText,
            };
            setCustomComponent(<EditTeam teamInfo={teamInfo} />);
        }
        
    },[setCustomComponent]);

    return(
        <div className='teams-container'>
            <div className='add-team'>
                <h1 onClick={handleCreateTaskClick}>+ Add team</h1>
            </div>
            {showAddTeam &&
                <div className='add-team-background'>
                    <div className='add-team-div'>
                        <div className='close-window-container'>
                            <div className='close-window-title'>Add Team</div>
                            <div className='close-window' onClick={() => setShowAddTeam(false)}>X</div>
                        </div>
                        <div className='add-team-content'>
                            <AddTeam setShowCreateTask={setShowAddTeam} setTeamsArr={setTeamsArr} />
                        </div>
                    </div>
                </div>
            }
            <h2>All teams:</h2>
            <div className='teams-table-container'>
                <div className='teams-table'>
                    <div className='teams-header'>
                        <span>ID</span>
                        <span>name</span>
                        <span>Description</span>
                        <span>members</span>
                        <img src={refreshIcon} className='refresh' onClick={handleRefresh} />
                    </div>
                    {teamsArr.map((team, index) => (
                        <div className="team-row" key={index} onDoubleClick={handleEditTeam}>
                            <span>{team.teamId}</span>
                            <span>{team.teamName}</span>
                            <span>{team.teamTitle}</span>
                            <span>{team.usersInTeam}</span>
                            <img src={deleteIcon} className="delete-user" onClick={handleDeleteTeam}/> 
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default memo(Teams);