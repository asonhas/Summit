import { memo, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { axiosClient } from "../../../../axios";
import { userData } from "../../../../types/Types";
import AddUser from "./add-user/AddUser";
import { useUser } from "../../../../contexts/User-Context";
import refreshIcon from '../../../../assets/refresh-icon.png';
import deleteIcon from '../../../../assets/delete-user.png';
import './Users.css';
import Utils from "../../../../utils/Utils";
import Swal from "sweetalert2";
import axios from "axios";
import Input from "../input-component/Input";
import Button from "../button-component/Button";

function Users(): ReactNode{
    const { user } = useUser();
    const [ usersArr, setUsersArr] = useState<Array<userData>>([]);
    const [ showAddUser, setShowAddUser] = useState<boolean>(false);
    const [ password, setPassword ] = useState<string>('');
    const [ confirmPassword, setConfirmPassword ] = useState<string>('');
    const [ resetPassUser, setResetPassUser ] = useState<string>('');
    const showResetPAssDiv = useRef<boolean>(false);

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
                const response = await axiosClient.post('/api/users/',{
                    username:  user?.userName,
                });
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
        showResetPAssDiv.current = false;
        setResetPassUser('');
        setUsersArr([]);
    },[]);

    const handleDeleteUser = useCallback(async (event: React.MouseEvent<HTMLImageElement>)=>{
        const parentElement = event.currentTarget.parentElement as HTMLDivElement;
        if(parentElement){
            const spanElements = Array.from(parentElement.querySelectorAll('span')) as HTMLSpanElement[];
            if(spanElements){
                const username = spanElements[3].innerText;
                if(typeof username == 'string' && username.length > 0){
                    Swal.fire({
                        title:'Enter summit token',
                        input: 'text',
                        inputPlaceholder: 'Summit token',
                        showCancelButton: true,
                        confirmButtonText: 'Verify',
                        cancelButtonText: 'Cancel',
                        inputValidator: (value) => {
                            if (!value) {
                                return 'You need to enter a code!';
                            }
                        }
                    }).then(async (result)=>{
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
                                    if (error.response && error.response.status === 401) {
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

    const handleResetPassword = useCallback((event: React.MouseEvent<HTMLDivElement>)=>{
        const row = (event.target as HTMLElement).parentElement;
        if(row){
            const userRow = row.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
            showResetPAssDiv.current = true;
            setResetPassUser(userRow[3].innerText);
        }
    },[]);

    const habdleResetPassword = useCallback(async ()=>{
        if(password.length > 0 && confirmPassword.length > 0 && resetPassUser.length > 0){
            if(password === confirmPassword){
                try {
                    const response = await axiosClient.post(`/api/users/update/${resetPassUser}`,{
                        password,
                    });
                    if(response){
                        showResetPAssDiv.current = false;
                        setPassword('');
                        setConfirmPassword('');
                        setResetPassUser('');
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
    },[confirmPassword, password, resetPassUser]);

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
                            <div className="user-row" key={index} onDoubleClick={handleResetPassword}> 
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
            {showResetPAssDiv.current && 
                <form noValidate>
                <div className="edit-user-container">
                    <h2>Reset password - {resetPassUser}</h2>
                    <div className="reset-pass-row">
                        <h3>Password:</h3>
                        <Input id='newPass' type="password" value={password} onChange={handleChangePass} width="300px" />
                    </div>
                    <div className="reset-pass-row">
                        <h3>Confirm password:</h3>
                        <Input id='confirmPass' type="password" value={confirmPassword} onChange={handleChangeConfirmPass} width="300px" />
                    </div>
                    <div className="reset-pass-row">
                        <Button width="100%" onClick={habdleResetPassword}>Reset password</Button>
                    </div>
                </div>
                </form>
            }
        </div>
    );
}
export default memo(Users);