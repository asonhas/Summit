import { memo, ReactNode, useCallback, useEffect, useState } from "react";
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

function Users(): ReactNode{
    const { user } = useUser();
    const [usersArr, setUsersArr] = useState<Array<userData>>([]);
    const [showAddUser, setAddUser] = useState<boolean>(false);
    

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

    return(
        <div className='users-container'>
            <div className='add-user'>
                <h1 onClick={()=> setAddUser(true)}>+ Add user</h1>
            </div>
            {showAddUser &&
                <div className='add-user-background'>
                    <div className='add-user-div'>
                        <div className='close-window-container'>
                            <div className='close-window-title'>Add new user</div>
                            <div className='close-window' onClick={() => setAddUser(false)}>X</div>
                        </div>
                        <div className='add-user-content'>
                            <AddUser setAddUser={setAddUser} />
                        </div>
                    </div>
                </div>
            }
            <h2>All users:</h2>
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
                        <div className="user-row" key={index}> 
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
    );
}
export default memo(Users);