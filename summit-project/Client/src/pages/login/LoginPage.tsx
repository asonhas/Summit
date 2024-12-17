import { useCallback } from 'react';
import logo from '../../assets/logo.png';
import backgroundImage from '../../assets/background.jpg'
import { axiosClient } from '../../axiosClient';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function Login() {
    const navigate = useNavigate()
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
            if(response.status == 200){
                navigate('www.google.com');
            }
            userinput.value = '';
            pwdInput.value = '';
        } catch (err: unknown) {
            alert(`Error occurred: ${(err as AxiosError).response?.data}`);
        }
    },[navigate]);

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

export default Login;