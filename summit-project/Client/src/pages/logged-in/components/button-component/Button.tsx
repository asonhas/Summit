import { memo, ReactNode } from "react";
import './Button.css';
interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    width?: string;
    height?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
}

function Button({ children, onClick, width, height, marginTop, marginBottom, marginLeft, marginRight }: ButtonProps): ReactNode {
    return (
        <div
            className='btn'
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick?.()}
            style={{
                width: width ? width : undefined,
                height: height ? height : undefined,
                marginLeft: marginLeft ? marginLeft : undefined,
                marginTop: marginTop ? marginTop : undefined,
                marginBottom: marginBottom ? marginBottom: undefined,
                marginRight: marginRight ? marginRight: undefined,
            }}
        >
            {children}
        </div>
    );
}

export default memo(Button);
