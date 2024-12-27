import { memo, ReactNode } from "react";
import { useUser } from "../../../../contexts/User-Context";
import logo from '../../../../assets/logo.png';
import './Header.css';

function Header(): ReactNode{
    const { user } = useUser ();
    return(
        <div className='headerContainer'>
            <img width='40px' height='30px' src={logo} />
            <div className='title'>Summit Tasks Management</div>
            <div className='userData'>
                {user && `${user.firstName} ${user.lastName} `}
            </div>
        </div>
    );
}

export default memo(Header);