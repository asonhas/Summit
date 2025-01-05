import { memo, ReactNode, useCallback, useState } from "react";
import Header from "./components/header/Header";
import LeftNavbar from "./components/left-navbar/LeftNavbar";
import Tasks from "./components/tasks/Tasks";
import Home from "./components/home/Home";
import Teams from "./components/teams/Teams";
import Calendar from "./components/calendar/Calendar";
import Chat from "./components/chat/Chat";
import './mainContent.css';
import Users from "./components/users/Users";
import { activeComponentValues } from "../../types/Types";

function MainContent(): ReactNode{
    const [activeComponent, setActiveComponent] = useState<activeComponentValues>('Tasks');
    const [customComponent, setCustomComponent] = useState<ReactNode | null>(null);

    const renderComponent = useCallback(()=>{
        switch (activeComponent) {
            case 'Home':
                return <Home />;
            case 'Tasks':
                return <Tasks setCustomComponent={setCustomComponent} />;
            case 'Teams':
                return <Teams setCustomComponent={setCustomComponent} />;
            case 'Calendar':
                return <Calendar />;
            case 'Chat':
                return <Chat />;
            case 'Users':
                return <Users />;
            default:
                return <Tasks setCustomComponent={setCustomComponent} />;
        }
    },[activeComponent]);

    return(
        <div className='mainContentContainer'>
            <Header />
            <div className='contentWrapper'>
                <LeftNavbar setActiveComponent={setActiveComponent} setCustomComponent={setCustomComponent} />
                <div className='componentSwitcher'>
                    {customComponent || renderComponent()}
                </div>
            </div>
        </div>
    );
}

export default memo(MainContent);