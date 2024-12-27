import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import './AddUser.css';
import { axiosClient } from "../../../../../axios";

interface AddUserProps {
    setAddUser: (setAddUser: boolean) => void;
}

type PermissionsValues = 'regular' | 'administrator';

function AddUder({ setAddUser }: AddUserProps):ReactNode{
    const [ permissions, setPermissions] = useState<PermissionsValues>('regular');
    useEffect(()=>{
        setAddUser(true);
        const authenticatorDiv = document.getElementById('authenticator-div') as HTMLDivElement;
        authenticatorDiv.style.display = 'none';
    },[setAddUser]);

    const addUser = useCallback(async () =>{
        try {
            let secret = '';
            const fNameElement = document.getElementById('fName') as HTMLInputElement;
            const lNameElement = document.getElementById('lName') as HTMLInputElement;
            const userNameElement = document.getElementById('userName') as HTMLInputElement;
            const emailElement = document.getElementById('email') as HTMLInputElement;
            const passwordElement = document.getElementById('pass') as HTMLInputElement;
            const repeatPasswordElement = document.getElementById('repeatPass') as HTMLInputElement;
            if(
                (fNameElement.value.length > 0 &&
                lNameElement.value.length > 0 &&
                userNameElement.value.length > 0 &&
                emailElement.value.length > 0 &&
                passwordElement.value.length > 0 &&
                repeatPasswordElement.value.length > 0) &&(
                    passwordElement.value == repeatPasswordElement.value
                )
            ){
                const adduserResponse = await axiosClient.put('/api/users/adduser',{
                    firstName: fNameElement.value,
                    lastName:  lNameElement.value,
                    newusername: userNameElement.value,
                    email: emailElement.value,
                    password: passwordElement.value,
                    permissions,
                });
                
                if(adduserResponse.status == 11000){
                    console.log('status 11000:',adduserResponse.data);
                } else if(adduserResponse.status == 404){
                    console.log('status 404',adduserResponse.data);
                }else if(adduserResponse.status == 200){
                    secret = String(adduserResponse.data.qrCode);
                }
            }
            return secret;
        } catch (error) {
            console.error(error);
        }
    },[permissions]);

    const handleSetPermissions = useCallback<(event: React.ChangeEvent<HTMLSelectElement>)=> void>((event: React.ChangeEvent<HTMLSelectElement>) => {
        setPermissions(event.target.value as PermissionsValues);
    },[]); 

    const handleSaveUser = useCallback(async ()=>{
        const secretQr = await addUser();
        const addUserDiv = document.querySelector('.add-user-div') as HTMLDivElement;
        addUserDiv.style.height = '730px';
        const authenticatorDiv = document.getElementById('authenticator-div') as HTMLDivElement;
        authenticatorDiv.style.display = 'flex';
        // disable save btn
        const saveBtn = document.querySelector('.save-btn') as HTMLDivElement;
        saveBtn.style.pointerEvents = 'none';
        saveBtn.style.opacity = '0.6';
        // make all inputs read only
        const qrImg = document.getElementById('qrImg') as HTMLImageElement;
        qrImg.src = secretQr as string;
    },[addUser]);
    return(
        <div className="table">
            <div className="row">
                <div className="cell"><h3>First name:</h3></div>
                <div className="cell"><input type="text" className='add-user-input' id='fName' /></div>
            </div>
            <div className="row">
                <div className="cell"><h3>Last name:</h3></div>
                <div className="cell"><input type="text" className='add-user-input' id='lName'/></div>
            </div>
            <div className="row">
                <div className="cell"><h3>E-mail:</h3></div>
                <div className="cell"><input type="text" className='add-user-input' id='email'/></div>
            </div>
            <div className="row">
                <div className="cell"><h3>Username:</h3></div>
                <div className="cell"><input type="text" className='add-user-input' id='userName'/></div>
            </div>
            <div className="row">
                <div className="cell"><h3>Password:</h3></div>
                <div className="cell"><input type="password" className='add-user-input' id='pass'/></div>
            </div>
            <div className="row">
                <div className="cell"><h3>Repeat password:</h3></div>
                <div className="cell"><input type="password" className='add-user-input' id='repeatPass'/></div>
            </div>
            <div className="row">
                <div className="cell"><h3>Permissions:</h3></div>
                <div className="cell">
                    <select 
                        className='user-permissions'
                        value={permissions}
                        onChange={handleSetPermissions}>
                        <option value='Low'>regular</option>
                        <option value='Medium'>administrator</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="cell save-btn" onClick={handleSaveUser}><span>save</span></div>
            </div>
            <div id='authenticator-div' className="row" style={{height: '260px', overflow: 'hidden'}}>
                <div className="cell" style={{height: '70px'}}><h3>Google authenticator QR Code:</h3></div>
                <div className="last-row"><img id='qrImg' src="" /></div>
            </div>
        </div>
    );
}

export default memo(AddUder);