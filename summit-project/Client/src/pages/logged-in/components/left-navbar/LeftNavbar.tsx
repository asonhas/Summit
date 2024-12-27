import { memo, ReactNode } from "react";
import { useUser } from "../../../../contexts/User-Context";
import './LeftNavbar.css';

interface LeftNavbarProps {
    setActiveComponent: (component: string) => void;
}

function LeftNavbar({ setActiveComponent }: LeftNavbarProps): ReactNode{
    const { user } = useUser();
    return(
        <div className='leftNavbarCotainer'>
            <div className='option' onClick={() => setActiveComponent('Home')}>Home</div>
            <div className='option' onClick={() => setActiveComponent('Tasks')}>Tasks</div>
            <div className='option' onClick={() => setActiveComponent('Teams')}>Teams</div>
            <div className='option' onClick={() => setActiveComponent('Calendar')}>Calendar</div>
            <div className='option' onClick={() => setActiveComponent('Chat')}>Chat</div>
            {user?.permissions == 'administrator' ? <div className='option' onClick={() => setActiveComponent('Users')}>Users</div> : undefined}
        </div>
    );
}

export default memo(LeftNavbar);