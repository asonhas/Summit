import { memo, ReactNode, useCallback, useState } from "react";
import Header from "./components/header/Header";
import LeftNavbar from "./components/left-navbar/LeftNavbar";
import Tasks from "./components/tasks/Tasks";
import Home from "./components/home/Home";
import Teams from "./components/teams/Teams";
import Calendar from "./components/calendar/Calendar";
import Chat from "./components/chat/Chat";
import './mainContent.css';

function MainContent(): ReactNode{
    const [activeComponent, setActiveComponent] = useState<string>('Tasks ');

    const renderComponent = useCallback(()=>{
        switch (activeComponent) {
            case 'Home':
                return <Home />;
            case 'Tasks':
                return <Tasks />;
            case 'Teams':
                return <Teams />;
            case 'Calendar':
                return <Calendar />;
            case 'Chat':
                return <Chat />;
            default:
                return <Tasks />;
        }
    },[activeComponent]);

    return(
        <div className='mainContentContainer'>
            <Header />
            <div className='contentWrapper'>
                <LeftNavbar setActiveComponent={setActiveComponent} />
                <div className='componentSwitcher'>
                    {renderComponent()}
                </div>
            </div>
        </div>
    );
}

export default memo(MainContent);