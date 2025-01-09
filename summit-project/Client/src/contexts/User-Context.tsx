import { createContext, useState, useContext, ReactNode } from "react";
import Utils from "../utils/Utils";

export type UserData = {
  isLoggedIn: boolean
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  permissions: string;
};

type UserContextType = {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  
  const _userData = sessionStorage.getItem('userData');
  const {email, firstName, lastName, userName, permissions } = Utils.parseJwt(_userData as string);
  const _isLoggedIn = sessionStorage.getItem('isLoggedIn');
  let userData: UserData | null = null;
  userData = {
    email,
    firstName,
    lastName,
    userName,
    isLoggedIn: _isLoggedIn === 'true',
    permissions,
  };
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