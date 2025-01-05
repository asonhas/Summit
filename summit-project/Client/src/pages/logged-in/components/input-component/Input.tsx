import {  memo, ReactNode } from "react";

interface InputProps {
    type: "text" | "password";
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    width?: string;
    height?: string;
    value?: string;
  }

function Input( { type, onChange, width, height, value }: InputProps):ReactNode{
    const inputStyle: React.CSSProperties = {
        width: width || "100%", // Default to 100% if no width is provided
        height: height || "40px", // Default to 40px if no height is provided
        padding: "8px",
        border: "1px solid black",
        borderRadius: "8px",
        fontSize: "large",
        outline: "none",
    };


    return (
        <input
          type={type}
          onChange={onChange ? onChange : undefined}
          style={inputStyle}
          value={value ? value : ''}
        />
    );
}

export default memo(Input);