import { memo, ReactNode } from "react";
import Header from "./components/header/Header";
import LeftNavbar from "./components/left-navbar/LeftNavbar";
import './mainContent.css';

function MainContent(): ReactNode{
    return(
        <div className='mainContentContainer'>
            <Header />
            <div className='contentWrapper'>
                <LeftNavbar />
            </div>
            
        </div>
    );
}

export default memo(MainContent);