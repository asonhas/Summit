import { createContext, ReactNode, useCallback, useContext, useLayoutEffect, useMemo } from 'react';
import { useUser } from './User-Context';
import { axiosClient } from '../axios';
import axios from 'axios';

type AuthContextType = {
    logout?: () => void;
}
const AuthContext = createContext<AuthContextType>({});

function AuthProvider({ children }: { children: ReactNode }){
    const {  setUser } = useUser();
    const logout = useCallback(async () => {
      try {
        const response = await axiosClient.post('/api/users/logout');
        if(response.status === 200){
          sessionStorage.removeItem('userData');
          sessionStorage.removeItem('isLoggedIn');
        }  
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          sessionStorage.removeItem('userData');
          sessionStorage.removeItem('isLoggedIn');
        }
      }
      setUser({
        email: '',
        firstName: '',
        lastName: '',
        permissions: '',
        userName: '',
        isLoggedIn: false,
      })
    }, [setUser]);
    
    // create state for the AuthProvider context, the state will include the logout function
    const authContextData: AuthContextType = useMemo(() => ({
      logout,
    }), [logout]);


    useLayoutEffect(() => {
      const requestInterceptor = axiosClient.interceptors.request.use((req) => {
        const token: string = sessionStorage.getItem('userData') as string;
        
        if (typeof token == 'string' && token.length > 0) {
          req.headers.Authorization = `Bearer ${token}`;
        }
        
        /*if (req.method === 'post' || req.method === 'put' || req.method === 'delete') {
          req.data = {
            // Preserve existing data
            ...req.data, 
            };
        }*/
        return req; // Return the modified request configuration
      });
      
      const responseInterceptor = axiosClient.interceptors.response.use((response) => response, // Pass through successful responses
        (error) => {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('isLoggedIn');
            setUser({
              email: '',
              firstName: '',
              lastName: '',
              permissions: '',
              userName: '',
              isLoggedIn: false,
            })
          }
          return Promise.reject(error); // Reject the promise with the error
        }
      );

      return () => {
        axiosClient.interceptors.request.eject(requestInterceptor);
        axiosClient.interceptors.response.eject(responseInterceptor);
      };
    }, [logout, setUser]);

    return (
        <AuthContext.Provider value={authContextData}>
          {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      // if there is no value the hook is not being called within a function component that is rendered within a `ThemeContext`
      throw new Error('useAuthContext must be used within App');
    }
    return context;
  };

export default AuthProvider;