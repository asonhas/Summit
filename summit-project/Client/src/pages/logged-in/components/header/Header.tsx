import { memo, ReactNode } from "react";
import { useUserContext } from "../../../../contexts/User-Context";
import './Header.css';

function Header(): ReactNode{
    const { userData } = useUserContext();
    return(
        <div className='headerContainer'>
            <div className='userData'>
                {`${userData.firstName} ${userData.lastName} `}
                <img src="https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png" />
            </div>
            
        </div>
    );
}

export default memo(Header);