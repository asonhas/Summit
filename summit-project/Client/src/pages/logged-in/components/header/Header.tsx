import { memo, ReactNode } from "react";
import { useUser } from "../../../../contexts/User-Context";
import logo from '../../../../assets/logo.png';
import defaultuserimage from '../../../../assets/defaultuserimage.png';
import './Header.css';

function Header(): ReactNode{
    const { user } = useUser ();
    return(
        <div className='headerContainer'>
            <img width='40px' height='30px' src={logo} />
            <div className='title'>Sammit Tasks Management</div>
            <div className='userData'>
                {user && `${user.firstName} ${user.lastName} `}
                <img src={defaultuserimage} />
            </div>
        </div>
    );
}

export default memo(Header);