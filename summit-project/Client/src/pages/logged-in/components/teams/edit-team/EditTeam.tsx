import { memo, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import './EditTeam.css';
import { side, teamInfoType } from "../../../../../types/Types";
import Input from "../../input-component/Input";
import { axiosClient } from "../../../../../axios";
import Button from "../../button-component/Button";
import Utils from "../../../../../utils/Utils";

interface editTeamProps {
    teamInfo: teamInfoType;
}

function EditTeam({teamInfo}: editTeamProps): ReactNode{
    const [ teamInfoData, setTeamInfoData] = useState<teamInfoType>(teamInfo);
    const [ allUsers, setAllUsers ] = useState<Array<string>>([]);
    const users = useRef<Array<{ username: string }>>([]);
    const userToMove = useRef<string>('');
    const [ usersInGroup, setUsersInGroup ] = useState<Array<string>>([]);
    useEffect(()=>{
        axiosClient.post('/api/users/list-users').then((response)=>{
            if(response.data){
                users.current = response.data.users;
                const tempUsersArr: Array<string> = [];
                const tempUsersInTeam: Array<string> = []
                users.current.forEach((user)=> {
                    if(user.username != 'summit'){
                        if(! teamInfoData.teamMembers.includes(user.username)){
                            tempUsersArr.push(user.username);
                        }else{
                            tempUsersInTeam.push(user.username);
                        }
                    }
                });
                setAllUsers(tempUsersArr);
                setUsersInGroup(tempUsersInTeam);
            }
        });

    },[teamInfoData.teamMembers]);
    

    const handleUserClick = useCallback((element: HTMLLIElement)=>{
        const listItems = document.querySelectorAll('li') as NodeListOf<HTMLLIElement>;
        listItems.forEach((li)=>{
            li.style.backgroundColor = '';
            li.style.fontWeight = '';
        });
        element.style.backgroundColor = 'lightgray';
        element.style.fontWeight = 'bold';
        userToMove.current = element.innerText;
    },[]);

    const moveSide = useCallback((side: side)=>{
        if(side == 'right'){
            const index = allUsers.indexOf(userToMove.current);
            if(index > -1){
                const tmpAllUsers: Array<string> = allUsers.filter(item => item !== userToMove.current);
                setAllUsers(tmpAllUsers);
                
                usersInGroup.unshift(userToMove.current);
                setUsersInGroup(usersInGroup);
            }
        }else{
            const index = usersInGroup.indexOf(userToMove.current);
            if(index > -1){
                const tmpUsersInGroup: Array<string> = usersInGroup.filter((item => item !== userToMove.current));
                setUsersInGroup(tmpUsersInGroup);

                allUsers.unshift(userToMove.current);
                setAllUsers(allUsers);
            }
        }
        userToMove.current = '';
        const listItems = document.querySelectorAll('li') as NodeListOf<HTMLLIElement>;
        listItems.forEach((li)=>{
            li.style.backgroundColor = '';
            li.style.fontWeight = '';
        });
    },[allUsers, usersInGroup]);
    
    const handleChangeTeamName = useCallback((event: React.ChangeEvent<HTMLInputElement>)=>{
        setTeamInfoData((prev)=>({
            ...prev,
            teamName: event.target.value,
        }));
    },[]);
    const handleChangeTeamDescription = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>)=>{
        setTeamInfoData((prev)=>({
            ...prev,
            teamDescription: event.target.value,
        }));
    },[]);

    const handleSaveBtn = useCallback(async ()=>{
        try {
            const response = await axiosClient.post(`/api/teams/update/${teamInfoData.teamId}`,{
                teamName: teamInfoData.teamName,
                teamTitle: teamInfoData.teamDescription,
                usersInTeam: usersInGroup.join(),
            });
            if(response.status == 200){
                return Utils.customAlert('Edit team',`Team ${teamInfoData.teamId} updated successfully`,'success','OK');
            }
        } catch (error) {
            console.error(error);
            return Utils.customAlert('Edit team','Missing required data.','error','OK'); 
        }
    },[teamInfoData.teamDescription, teamInfoData.teamId, teamInfoData.teamName, usersInGroup]);

    return(
        <div className='edit-team-container'>
            <div className='team-id'><h2>{teamInfo.teamId}</h2></div>
            <div className='team-content'>
                <div>
                    <h2>Team name: </h2>
                    <Input type="text" width="500px" value={teamInfoData.teamName} focusEfect={true} onChange={handleChangeTeamName}/>
                </div>
                <div>
                    <h2>Team description: </h2>
                    <textarea className='textarea-input' value={teamInfoData.teamDescription || ''} onChange={handleChangeTeamDescription}></textarea>
                </div>
                <div>
                    <div className="users">
                        <div>
                            <h2>All users:</h2>
                            <ul>
                                {allUsers.map((user,index)=>(
                                    <li key={index}  onClick={(event) => handleUserClick(event.currentTarget)}>{user}</li>
                                ))}
                            </ul>
                        </div>
                        <div className='add-remove'>
                            <h3 onClick={()=> moveSide('right')}>{'>>'}</h3>
                            <h3 onClick={()=> moveSide('left')}>{'<<'}</h3>
                        </div>
                        <div>
                            <h2>Users in team:</h2>
                            <ul>
                                {usersInGroup.map((user,index)=>(
                                    <li key={index} onClick={(event) => handleUserClick(event.currentTarget)}>{user}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div>
                    <Button width="500px" onClick={handleSaveBtn}>Save</Button>
                </div>
            </div>
        </div>
    );
}
export default memo(EditTeam);