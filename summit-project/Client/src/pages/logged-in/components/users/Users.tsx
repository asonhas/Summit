import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import { axiosClient } from "../../../../axios";
import { editUserValues, PermissionsValues, userData } from "../../../../types/Types";
import AddUser from "./add-user/AddUser";
import { useUser } from "../../../../contexts/User-Context";
import refreshIcon from '../../../../assets/refresh-icon.png';
import deleteIcon from '../../../../assets/delete-user.png';
import Utils from "../../../../utils/Utils";
import axios from "axios";
import Input from "../input-component/Input";
import Button from "../button-component/Button";
import './Users.css';

function Users(): ReactNode{
    const { user } = useUser();
    const [ usersArr, setUsersArr] = useState<Array<userData>>([]);
    const [ showAddUser, setShowAddUser] = useState<boolean>(false);
    const [ password, setPassword ] = useState<string>('');
    const [ confirmPassword, setConfirmPassword ] = useState<string>('');
    const [ editUserInfo, setEditUserInfo ] = useState<editUserValues>({
        username: '',
        email: '',
        Permissions: 'regular',
        firstName: '',
        lastName: '',
    });
    const [ showEditUserDiv, setShowEditUserDiv ] = useState<boolean>(false);

    useEffect(() => {
        const deleteIcons = document.querySelectorAll('.delete-user') as NodeListOf<Element>;
        deleteIcons.forEach((deleteIcon) => {
            deleteIcon.addEventListener('mouseenter', function() {
                const parentDiv = deleteIcon.parentElement as HTMLElement | null; // Ensure the parent is an HTMLElement or null
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

        const fetchUsers = async () => {
            try {
                const response = await axiosClient.get('/api/users/');
                if (response?.data?.usersData) {
                    setUsersArr(response.data.usersData);
                }
            } catch (error) {
                console.log(error);
            }
        };
        if(usersArr.length == 0){
            fetchUsers();
        }
        
    }, [showAddUser, user?.userName, usersArr.length]);
    const handleRefresh = useCallback(()=>{
        setShowEditUserDiv(false);
        setEditUserInfo((prev)=> ({...prev, username: ''}));
        setUsersArr([]);
    },[]);

    const handleDeleteUser = useCallback(async (event: React.MouseEvent<HTMLImageElement>)=>{
        const parentElement = event.currentTarget.parentElement as HTMLDivElement;
        if(parentElement){
            const spanElements = Array.from(parentElement.querySelectorAll('span')) as HTMLSpanElement[];
            if(spanElements){
                const username = spanElements[3].innerText;
                if(typeof username == 'string' && username.length > 0){
                    Utils.customAlert2Fa().then(async (result)=>{
                        if (result.isConfirmed) {
                            try {
                                const response = await axiosClient.delete(`/api/users/delete/`,{
                                    data: {userToDelete: username, tokentoVerify: result.value },
                                });
                                if (response && response.status === 200){
                                    Utils.customAlert('Delete user',`user ${username} is successfuly deleted`,'success','OK');
                                    setUsersArr([]);
                                }
                            } catch (error) {
                                if(axios.isAxiosError(error)){
                                    if (error.response && error.response.status === 404) {
                                        return Utils.customAlert('Delete user','Token verification failed.','error','OK');        
                                    } 
                                    if (error.response && error.response.status === 400) {
                                        return Utils.customAlert('Delete user','Missing required data.','error','OK');        
                                    }
                                }
                                Utils.customAlert('Delete user','Something went wrong, try again later.','error','OK');
                            }
                        }
                    })
                }
            }
        }
    },[]);

    const handleChangePass = useCallback((event: React.ChangeEvent<HTMLInputElement>)=>{
        setPassword(event.target.value);
    },[]);

    const handleChangeConfirmPass = useCallback((event: React.ChangeEvent<HTMLInputElement>)=>{
        setConfirmPassword(event.target.value);
    },[]);

    const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>)=>{
        const row = (event.target as HTMLElement).parentElement;
        if(row){
            const userRow = row.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
            setShowEditUserDiv(true);
            setEditUserInfo(({
                firstName: userRow[0].innerText, 
                lastName: userRow[1].innerText,
                email: userRow[2].innerText,
                username: userRow[3].innerText,
                Permissions: userRow[4].innerText as PermissionsValues,
            }));
        }
    },[]);

    const habdleResetPassword = useCallback(async ()=>{
        if(password.length > 0 && confirmPassword.length > 0 && editUserInfo.username.length > 0){
            if(password === confirmPassword){
                try {
                    const response = await axiosClient.post(`/api/users/update/${editUserInfo.username}`,{
                        password,
                    });
                    if(response){
                        setShowEditUserDiv(false);
                        setPassword('');
                        setConfirmPassword('');
                        setEditUserInfo((prev)=> ({...prev,username: ''}));
                        Utils.customAlertWithImage('Reset password','Google authenticator QR Code:',response.data.qrCode,'Close',300,300,'QR Code');
                    }    
                } catch (error) {
                    console.log(error);
                }
                
            }else{
                Utils.customAlert('Reset password','Passwords do not match. Please try again','info','OK');
            }
        }else{
            Utils.customAlert('Reset password','Please enter a password','info','OK');
        }
    },[confirmPassword, editUserInfo.username, password]);
 
    const handleUpdateUser = useCallback(async ()=>{
        if(editUserInfo && 
            editUserInfo.firstName.length > 0 &&
            editUserInfo.lastName.length > 0 &&
            editUserInfo.email.length > 0 &&
            editUserInfo.Permissions.length > 0
        ){
            try {
                const response = await axiosClient.post(`/api/users/update/${editUserInfo.username}`,{
                    firstName: editUserInfo.firstName,
                    lastName: editUserInfo.lastName,
                    email: editUserInfo.email,
                    permissions: editUserInfo.Permissions,
                });
                if(response){
                    Utils.customAlert('Edit user','Changes saved successfully','success','OK');
                    setShowEditUserDiv(false);
                    setEditUserInfo({
                        username: '',
                        email: '',
                        Permissions: 'regular',
                        firstName: '',
                        lastName: '',
                    });
                    setUsersArr([]);
                }
            } catch (error) {
                if(axios.isAxiosError(error)){
                    if (error.response && error.response.status === 400) {
                        Utils.customAlert('Edit user','The request is malformed or invalid.','error','OK');
                    } 
                }
            }
        }
    },[editUserInfo]);
    return(
        <div className='users-container'>
            <div className="users-data">
                <div className='add-user'>
                    <h1 onClick={()=> setShowAddUser(true)}>+ Add user</h1>
                </div>
                {showAddUser &&
                    <div className='add-user-background'>
                        <div className='add-user-div'>
                            <div className='close-window-container'>
                                <div className='close-window-title'>Add new user</div>
                                <div className='close-window' onClick={() => setShowAddUser(false)}>X</div>
                            </div>
                            <div className='add-user-content'>
                                <AddUser setShowAddUser={setShowAddUser} setUsersArr={setUsersArr} />
                            </div>
                        </div>
                    </div>
                }
                <h2 style={{minHeight: '30px'}}>All users:</h2>
                <div className='users-table-container'>
                    <div className='users-table'>
                        <div className='users-header'>
                            <span>First name</span>
                            <span>Last name</span>
                            <span>E-mail</span>
                            <span>Username</span>
                            <span>Permissions</span>
                            <img src={refreshIcon} className='refresh' onClick={handleRefresh} />
                        </div>
                        {usersArr .filter((userItem) => userItem.userName !== user?.userName).map((userItem, index) => ( 
                            <div className="user-row" key={index} onDoubleClick={handleDoubleClick}> 
                                <span>{userItem.firstName}</span> 
                                <span>{userItem.lastName}</span> 
                                <span>{userItem.email}</span>
                                <span>{userItem.userName}</span> 
                                <span>{userItem.permissions}</span> 
                                <img src={deleteIcon} className="delete-user" onClick={handleDeleteUser}/> 
                            </div> 
                        ))}
                    </div>
                </div>
            </div>
            {showEditUserDiv && 
                <form noValidate>
                <div className="edit-user-container">
                    <div>
                       <h2>Edit user: - {editUserInfo.username}</h2>
                       <div className="row">
                            <h3>First name:</h3>
                            <Input type="text" focusEfect={true} marginLeft="20px" value={editUserInfo.firstName} onChange={(event)=>setEditUserInfo((prev)=> ({...prev, firstName: event.target.value}))} width="300px"/>
                       </div>
                       <div className="row">
                            <h3>Last name:</h3>
                            <Input type="text" focusEfect={true} marginLeft="20px" value={editUserInfo.lastName} onChange={(event)=>setEditUserInfo((prev)=> ({...prev, lastName: event.target.value}))} width="300px"/>
                       </div>
                       <div className="row">
                            <h3>Email:</h3>
                            <Input type="text" focusEfect={true} marginLeft="63px" value={editUserInfo.email} onChange={(event)=>setEditUserInfo((prev)=> ({...prev, email: event.target.value}))} width="300px"/>
                       </div>
                       <div className="row">
                            <h3>Permissions:</h3>
                            <select 
                                style={{marginLeft: '3px'}}
                                className='permissions'
                                value={editUserInfo.Permissions}
                                onChange={(event)=> setEditUserInfo((prev)=>({...prev, Permissions: event.target.value as PermissionsValues}))}>
                                <option value='regular'>regular</option>
                                <option value='administrator'>administrator</option>
                            </select>
                       </div>
                       <div className="row">
                            <Button width="100%" height="40px" onClick={handleUpdateUser}>Update user</Button>
                        </div>
                    </div>
                    <div className="reset-pass">
                        <h2>Reset password - {editUserInfo.username}</h2>
                        <div className="row">
                            <h3>Password:</h3>
                            <Input type="password" focusEfect={true} value={password} onChange={handleChangePass} width="300px" marginLeft="75px" />
                        </div>
                        <div className="row">
                            <h3>Confirm password:</h3>
                            <Input type="password" focusEfect={true} value={confirmPassword} onChange={handleChangeConfirmPass} width="300px" />
                        </div>
                        <div className="row" style={{marginTop: 'auto'}}>
                            <Button width="100%" height="40px" onClick={habdleResetPassword}>Reset password</Button>
                        </div>
                    </div>
                    <div style={{minWidth: '150px'}}>
                        <Button width="20px" minWidth="100px" onClick={()=> setShowEditUserDiv(false)}>Close</Button>
                    </div>
                </div>
                </form>
            }
        </div>
    );
}
export default memo(Users);