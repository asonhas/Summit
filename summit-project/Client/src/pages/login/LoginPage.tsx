import { memo, ReactNode, useCallback, useState } from 'react';
import logo from '../../assets/logo.png';
import backgroundImage from '../../assets/background.jpg'
import { axiosLogin } from '../../axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/User-Context';
import { userCredentials, userData } from '../../types/Types';
import './LoginPage.css';
import Utils from '../../utils/Utils';
import Input from '../logged-in/components/input-component/Input';
import Button from '../logged-in/components/button-component/Button';
import axios from 'axios';

function Login(): ReactNode {
    const navigate = useNavigate()
    const { setUser } = useUser();
    const [ userCredentials , setUserCredentials] = useState<userCredentials>({
        username: '',
        password: '',
    });
    
    const handleLogin = useCallback(async ()=>{
        let otp: string = '';
        console.log('username: ',userCredentials.username);
        if(userCredentials.username != 'summit'){
            const result = await Utils.customAlert2Fa();
            if(result.isConfirmed){
                otp = result.value as string
            }
        }
        try {
            const response = await axiosLogin.post('/api/users/login', {
                user: userCredentials.username,
                pass: userCredentials.password,
                otp,
            });
            if(response && response.status == 200){
                const { token }: userData = response.data; 
                if(token){
                    const {email, firstName, lastName, userName, permissions } = Utils.parseJwt(token);
                    // save user data in session storage
                    sessionStorage.setItem('userData', token.valueOf());
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
                }else{
                    console.error('no token');
                }
            }
        } catch (error) {
            if(axios.isAxiosError(error)){
                if (error.response && error.response.status === 401) {
                    if(String(error.response?.data.message).includes('Token')){
                        return Utils.customAlert('Summit','Token you’ve entered is incorrect','info','OK')
                    }
                    Utils.customAlert('Summit','Username or password you’ve entered is incorrect','info','OK');
                }
            }
            setUserCredentials({username: '', password: ''});
        }
    },[navigate, setUser, userCredentials.password, userCredentials.username]);

    return (
        <div className='backGround' >
            <img src={backgroundImage} height='100%' />
            <div className="login-container">
                <h1>Summit</h1>
                <img src={logo} height='200px'/>
                <form noValidate>
                <Input type='text' value={userCredentials.username} placeholder='Enter your username' marginBottom='10px' marginTop='25px' 
                    onChange={(e)=> setUserCredentials((prevState)=>({...prevState, username: e.target.value}))} required />
                <Input type='password' value={userCredentials.password} placeholder='Enter your password' marginBottom='15px' id='pwd' 
                    onChange={(e)=> setUserCredentials((prevState)=>({...prevState, password: e.target.value}))} required/>
                <Button width='100%' marginTop='5px' onClick={handleLogin}>Log In</Button>
                </form>
            </div>
        </div>
    );
};

export default memo(Login);