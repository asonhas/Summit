import { memo, ReactNode } from "react";
import './Button.css';
interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    width?: string;
    marginLeft?: string;
}

function Button({ children, onClick, width, marginLeft }: ButtonProps): ReactNode {
    return (
        <div
            className='btn'
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick?.()}
            style={{
                width: width ? width : undefined,
                marginLeft: marginLeft ? marginLeft : undefined,
            }}
        >
            {children}
        </div>
    );
}

export default memo(Button);
