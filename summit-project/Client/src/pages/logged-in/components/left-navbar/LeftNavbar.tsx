import { memo, ReactNode } from "react";
import './LeftNavbar.css';

interface LeftNavbarProps {
    setActiveComponent: (component: string) => void;
}

function LeftNavbar({ setActiveComponent }: LeftNavbarProps): ReactNode{
    return(
        <div className='leftNavbarCotainer'>
            <div className='option' onClick={() => setActiveComponent('Home')}>Home</div>
            <div className='option' onClick={() => setActiveComponent('Tasks')}>Tasks</div>
            <div className='option' onClick={() => setActiveComponent('Teams')}>Teams</div>
            <div className='option' onClick={() => setActiveComponent('Calendar')}>Calendar</div>
            <div className='option' onClick={() => setActiveComponent('Chat')}>Chat</div>
        </div>
    );
}

export default memo(LeftNavbar);