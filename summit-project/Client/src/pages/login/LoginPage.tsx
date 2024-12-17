import { memo, ReactNode, useCallback } from 'react';
import logo from '../../assets/logo.png';
import backgroundImage from '../../assets/background.jpg'
import { axiosClient } from '../../axiosClient';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { useUserContext } from '../../contexts/User-Context';

function Login(): ReactNode {
    const navigate = useNavigate()
    const { dispatch: dispatchUserData } = useUserContext();
    const handleLogin = useCallback(async ()=>{
        try {
            const userinput = document.getElementById('uid') as HTMLInputElement;
            const pwdInput = document.getElementById('pwd') as HTMLInputElement;
            const response = await axiosClient.post('/api/users/login', {
                'user': userinput.value,
                'pass': pwdInput.value
            },{
                withCredentials: true,
            });
            if(response && response.status == 200){
                const { email, fName, lName, userName } = response.data; 
                if(dispatchUserData){
                    dispatchUserData({
                        isLoggedIn: true,
                        email: email as string,
                        firstName: fName as string,
                        lastName: lName as string,
                        username: userName as string,
                    });
                }
                navigate('/main');
            }
            userinput.value = '';
            pwdInput.value = '';
        } catch (err: unknown) {
            alert(`Error occurred: ${(err as AxiosError).response?.data}`);
        }
    },[dispatchUserData, navigate]);

    return (
        <div className='backGround' >
            <img src={backgroundImage} />
            <div className="login-container">
                <h1>Summit Login</h1>
                <img src={logo} height='200px'/>
                <input id="uid" type="text" placeholder="Enter your username" required />
                <input id="pwd" type="password" placeholder="Enter your password" required />
                <button type="button" onClick={handleLogin} >Log In</button>
            </div>
        </div>
    );
};

export default memo(Login);