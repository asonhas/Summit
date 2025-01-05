import { memo, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { axiosClient } from "../../../../../axios";
import './AddTeam.css';
import Utils from "../../../../../utils/Utils";
import axios from "axios";
import { side } from "../../../../../types/Types";

interface AddTeamProps {
    setShowCreateTask: (setShowCreateTask: boolean) => void;
}


function AddTeam({ setShowCreateTask }: AddTeamProps): ReactNode{
    const users = useRef<Array<{ username: string }>>([]);
    const userToMove = useRef<string>('');
    const [ allUsers, setAllUsers ] = useState<Array<string>>([]);
    const [ usersInGroup, setUsersInGroup ] = useState<Array<string>>([]);

    const teamInfo = useRef({
        name: '',
        title: '',
    });
    
    useEffect(()=>{
        axiosClient.post('/api/users/list-users').then((response)=>{
            if(response.data){
                users.current = response.data.users;
                const tempUsersArr: Array<string> = [];
                users.current.forEach((user)=> {
                    if(user.username != 'summit'){
                        tempUsersArr.push(user.username);
                    }
                });
                setAllUsers(tempUsersArr);
            }
        });
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

    const handleInputChange = useCallback((field: string, element: HTMLInputElement)=>{
        if(field == 'name'){
            teamInfo.current.name = element.value;
        }
        if(field == 'title'){
            teamInfo.current.title = element.value;
        }
    },[]);

    const handleSaveBtnClick = useCallback(async ()=>{
        if(teamInfo.current.name.length >0 && teamInfo.current.title.length >0 && usersInGroup.length > 0){
            try {
                const response = await axiosClient.put('/api/teams/saveTeam',{
                    teamName: teamInfo.current.name,
                    teamTitle: teamInfo.current.title,
                    usersInTeam: usersInGroup.join(),
                });
                if(response.status == 201){
                    Utils.customAlert('Add team','The team was added successfully','success','OK');
                    setShowCreateTask(false);
                }
            } catch (error) {
                if(axios.isAxiosError(error)){
                    if (error.response && error.response.status === 403) {
                        return Utils.customAlert('Add team','You do not have permission to perform the requested action','info','OK');
                    } 
                }
                Utils.customAlert('Add team','Something went wrong.','error','OK');
            }
        }else{
            Utils.customAlert('Add team','All fields are required.','info','OK');
        }
    },[setShowCreateTask, usersInGroup]);

    return(
        <div className="team-table">
            <div className="team-row">
                <div className="team-cell"><h3>Team name:</h3></div>
                <div className="team-cell"><input type="text" id='team-name' onChange={(element)=> handleInputChange('name', element.currentTarget)} /></div>
            </div>
            <div className="team-row">
                <div className="team-cell"><h3>Team title:</h3></div>
                <div className="team-cell"><input type="text" id='team-title'onChange={(element)=> handleInputChange('title', element.currentTarget)} /></div>
            </div>
            <div className="team-row" style={{height: '210px'}}>
                <div className='users'>
                    <h3>All users:</h3>
                    <div className='users-box'>
                        <ul>
                            {allUsers.map((user,index)=>(
                                <li key={index}  onClick={(event) => handleUserClick(event.currentTarget)}>{user}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className='add-remove'>
                    <h3 onClick={()=> moveSide('right')}>{'>>'}</h3>
                    <h3 onClick={()=> moveSide('left')}>{'<<'}</h3>
                </div>
                <div className='users'>
                    <h3>Users in group:</h3>
                    <div className='users-box'>
                        <ul>
                            {usersInGroup.map((user,index)=>(
                                <li key={index} onClick={(event) => handleUserClick(event.currentTarget)}>{user}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="team-row">
                <div className="team-cell save-btn" onClick={handleSaveBtnClick}><span>save</span></div>
            </div>
        </div>
    );
}

export default memo(AddTeam);