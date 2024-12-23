import { createContext, useState, useContext, ReactNode } from "react";

export type UserData = {
  isLoggedIn: boolean
  email: string;
  firstName: string;
  lastName: string;
  username: string;
};

type UserContextType = {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  
  const _userData = sessionStorage.getItem('userData');
  const _isLoggedIn = sessionStorage.getItem('isLoggedIn');
  let userData: UserData | null = null;
  if(_userData && _isLoggedIn){
    userData = JSON.parse(_userData);
    if(userData){
      userData.isLoggedIn = _isLoggedIn === 'true';
    }
  }
  const [user, setUser] = useState<UserData | null>(userData);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};