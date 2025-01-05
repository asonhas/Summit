import { memo, ReactNode, useCallback } from 'react';
import logo from '../../assets/logo.png';
import backgroundImage from '../../assets/background.jpg'
import { axiosLogin } from '../../axios';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/User-Context';
import { userData } from '../../types/Types';
import './LoginPage.css';
import Utils from '../../utils/Utils';

function Login(): ReactNode {
    const navigate = useNavigate()
    const { setUser } = useUser();
    const handleLogin = useCallback(async ()=>{
        try {
            const userinput = document.getElementById('uid') as HTMLInputElement;
            const pwdInput = document.getElementById('pwd') as HTMLInputElement;
            const response = await axiosLogin.post('/api/users/login', {
                'user': userinput.value,
                'pass': pwdInput.value
            });
            if(response && response.status == 200){
                const {_ud }: userData = response.data; 
                const {email, firstName, lastName, userName, permissions } = Utils.parseJwt(_ud);
                
                // save user data in session storage
                sessionStorage.setItem('userData', _ud.valueOf());
                // update isLoggedIn
                sessionStorage.setItem('isLoggedIn', 'true');
                setUser({
                    email,
                    firstName,
                    lastName,
                    userName,
                    isLoggedIn: true,
                    permissions,
                });
                navigate('/');
            }
        } catch (err: unknown) {
            (document.getElementById('uid') as HTMLInputElement).value = '';
            (document.getElementById('pwd') as HTMLInputElement).value = '';
            alert(`Error occurred: ${(err as AxiosError).response?.data}`);
        }
    },[navigate, setUser]);

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