import {  memo, ReactNode, useCallback, useState } from "react";

interface InputProps {
    type: "text" | "password";
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    width?: string;
    height?: string;
    value?: string;
    id?: string;
    placeholder?: string;
    required?: boolean;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    focusEfect?: boolean;
  }

function Input( { type, onChange, width, height, value, id, placeholder, required, marginTop, marginBottom, marginLeft, marginRight, focusEfect }: InputProps):ReactNode{
  const [isFocused, setIsFocused] = useState(false);
  const inputStyle: React.CSSProperties = {
    width: width || "100%", // Default to 100% if no width is provided
    height: height || "40px", // Default to 40px if no height is provided
    padding: "8px",
    border: isFocused ? "2px solid black" : "1px solid black",
    borderRadius: "8px",
    fontSize: "large",
    outline: "none",
    marginTop: marginTop ? marginTop : undefined,
    marginBottom: marginBottom ? marginBottom : undefined,
    marginLeft: marginLeft ? marginLeft : undefined,
    marginRight: marginRight ? marginRight: undefined,
  };

  const handleFocus  = useCallback(()=>{
    setIsFocused(true);
  },[]);
  const handleBlur = useCallback(()=>{
    setIsFocused(false);
  },[]);
  return (
    <input
      type={type}
      onChange={onChange ? onChange : undefined}
      style={inputStyle}
      value={value ? value : ''}
      id={id ? id : undefined}
      placeholder={placeholder ? placeholder : undefined}
      autoComplete={type === "password" ? "new-password" : undefined}
      required= {required ? required : undefined}
      onFocus={focusEfect ? handleFocus : undefined}
      onBlur={focusEfect ? handleBlur: undefined}
    />
  );
}

export default memo(Input);