import { memo, ReactNode } from "react";
import { useUser } from "../../../../contexts/User-Context";
import './LeftNavbar.css';
import { activeComponentValues } from "../../../../types/Types";
import { useAuthContext } from "../../../../contexts/Auth-Context";

interface LeftNavbarProps {
    setActiveComponent: (componentName: activeComponentValues) => void;
    setCustomComponent: (component: ReactNode | null) => void;
}

function LeftNavbar({ setActiveComponent, setCustomComponent }: LeftNavbarProps): ReactNode{
    const { user } = useUser();
    const { logout } = useAuthContext();
    return(
        <div className='leftNavbarCotainer'>
            {/*<div className='option' onClick={() => {
                setActiveComponent('Home');
                setCustomComponent(null);
            }}>Home</div>*/}
            <div className='option' onClick={() => {
                setActiveComponent('Tasks');
                setCustomComponent(null);
            }}>Tasks</div>
            <div className='option' onClick={() => {
                setActiveComponent('Teams');
                setCustomComponent(null);
            }}>Teams</div>
            <div className='option' onClick={() => {
                setActiveComponent('Calendar');
                setCustomComponent(null);
            }}>Calendar</div>
            <div className='option' onClick={() => {
                setActiveComponent('Chat');
                setCustomComponent(null);
            }}>Chat</div>
            {user?.permissions == 'administrator' ? <div className='option' onClick={() => {
                setActiveComponent('Users');
                setCustomComponent(null);
            }}>Users</div> : undefined}
            <div className='option logout' onClick={logout}>Logout</div>
        </div>
    );
}

export default memo(LeftNavbar);