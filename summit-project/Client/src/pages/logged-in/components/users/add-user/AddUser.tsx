import { memo, ReactNode, useCallback, useState } from "react";
import { axiosClient } from "../../../../../axios";
import Utils from "../../../../../utils/Utils";
import axios from "axios";
import { newUser, PermissionsValues, userData } from "../../../../../types/Types";
import './AddUser.css';
import Input from "../../input-component/Input";

interface AddUserProps {
    setShowAddUser: (setShowAddUser: boolean) => void;
    setUsersArr: (setUsersArr:Array<userData>) => void;
}


function AddUder({ setShowAddUser, setUsersArr }: AddUserProps):ReactNode{
    const [ newUser, setNewUser ] = useState<newUser>({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        repeatPassword: '',
        Permissions: 'regular',
    });

    const handleInputValueChange = useCallback(
        (input: keyof newUser, event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
            setNewUser((prev) => ({
                ...prev,
                [input]: input === 'Permissions' ? (event.target.value as PermissionsValues) : event.target.value,
            }));
        },
        []
    );

    const addUser = useCallback(async () =>{
        try {
            const returnedValues = {
                conflict: '',
                secret: '',
            };
            if(newUser &&
                (newUser.firstName.length > 0 &&
                newUser.lastName.length > 0 &&
                newUser.username.length > 0 &&
                newUser.email.length > 0 && /* write email validate function */
                newUser.password.length > 0 &&
                newUser.repeatPassword.length > 0) &&(
                    newUser.password == newUser.repeatPassword
                )
            ){
                try {
                    const adduserResponse = await axiosClient.put('/api/users/adduser',{
                        firstName: newUser.lastName,
                        lastName:  newUser.lastName,
                        newusername: newUser.username,
                        email: newUser.email,
                        password: newUser.password,
                        permissions: newUser.Permissions,
                    });
                    returnedValues.secret = adduserResponse.data.qrCode;
                } catch (error) {
                    if(axios.isAxiosError(error)){
                        if (error.response && error.response.status === 409) {
                            returnedValues.conflict = error.response.data.error;
                        } 
                    }
                }
            }
            return returnedValues;
        } catch (error) {
            console.error(error);
        }
    },[newUser]);

    const handleSaveUser = useCallback(async ()=>{
        const addUserReturndValues = await addUser();
        if(addUserReturndValues && addUserReturndValues.secret.length > 0){
            setShowAddUser(false);
            setUsersArr([]);
            Utils.customAlertWithImage('Add user','Google authenticator QR Code',addUserReturndValues.secret,'Close',300,300,'QR Code');
        }else{
            if(addUserReturndValues && addUserReturndValues.conflict.length > 0){
                Utils.customAlert('Error add user',`Adding the user failed because: ${addUserReturndValues.conflict}`,'info','Close');
            }else{
                Utils.customAlert('Error add user','Adding the user failed.','info','Close');
            }
        }
    },[addUser, setShowAddUser, setUsersArr]);
    return(
        <div className="table">
            <div className="row">
                <div className="cell"><h3>First name:</h3></div>
                <Input type="text" marginLeft="5px" marginTop="5px" value={newUser.firstName} width="300px" height="35px" focusEfect={true} onChange={(event)=> handleInputValueChange('firstName',event)}/>
            </div>
            <div className="row">
                <div className="cell"><h3>Last name:</h3></div>
                <Input type="text" marginLeft="5px" marginTop="5px" value={newUser.lastName} width="300px" height="35px" focusEfect={true} onChange={(event)=> handleInputValueChange('lastName',event)}/>
            </div>
            <div className="row">
                <div className="cell"><h3>E-mail:</h3></div>
                <Input type="text" marginLeft="5px" marginTop="5px" value={newUser.email} width="300px" height="35px" focusEfect={true} onChange={(event)=> handleInputValueChange('email',event)}/>
            </div>
            <div className="row">
                <div className="cell"><h3>Username:</h3></div>
                <Input type="text" marginLeft="5px" marginTop="5px" value={newUser.username} width="300px" height="35px" focusEfect={true} onChange={(event)=> handleInputValueChange('username',event)}/>
            </div>
            <div className="row">
                <div className="cell"><h3>Password:</h3></div>
                <Input type="password" marginLeft="5px" marginTop="5px" value={newUser.password} width="300px" height="35px" focusEfect={true} onChange={(event)=> handleInputValueChange('password',event)}/>
            </div>
            <div className="row">
                <div className="cell"><h3>Repeat password:</h3></div>
                <Input type="password" marginLeft="5px" marginTop="5px" value={newUser.repeatPassword} width="300px" height="35px" focusEfect={true} onChange={(event)=> handleInputValueChange('repeatPassword',event)}/>
            </div>
            <div className="row">
                <div className="cell"><h3>Permissions:</h3></div>
                <div className="cell">
                    <select 
                        className='user-permissions'
                        value={newUser.Permissions}
                        onChange={(event)=> handleInputValueChange('Permissions',event)}>
                        <option value='regular'>regular</option>
                        <option value='administrator'>administrator</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="cell save-btn" onClick={handleSaveUser}><span>save</span></div>
            </div>
        </div>
    );
}

export default memo(AddUder);