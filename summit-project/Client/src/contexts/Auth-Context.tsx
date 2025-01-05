import { createContext, ReactNode, useCallback, useContext, useLayoutEffect, useMemo } from 'react';
import { useUser } from './User-Context';
import { axiosClient } from '../axios';

type AuthContextType = {
    logout?: () => void;
}
const AuthContext = createContext<AuthContextType>({});

function AuthProvider({ children }: { children: ReactNode }){
    const { user, setUser: dispatchUserContext } = useUser();

    const logout = useCallback(async () => {
      /*try {
        await axiosClient.post('/api/users/logout'); // make api call to /logout
      } catch(err) {
        console.log('logout api call error: ', err);
      }
      // clear accessToken & refreshToken
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      window.localStorage.removeItem('isLoggedIn');
  
      dispatchUserContext?.(null); // clear user-context
  
      window.location.pathname = '/login' // navigate /login page*/
    }, []);
    
    // create state for the AuthProvider context, the state will include the logout function
    const authContextData: AuthContextType = useMemo(() => ({
      logout,
    }), [logout]);


    useLayoutEffect(() => {
        const requestInterceptor = axiosClient.interceptors.request.use((req) => {
            if (req.method === 'post' || req.method === 'put' || req.method === 'delete') {
                req.data = {
                    // Preserve existing data
                    ...req.data, 
                    // Add custom property
                    username: user?.userName, 
                    token: sessionStorage.getItem('userData'),
                };
            }
            return req; // Return the modified request configuration
        });
        return () => {
            axiosClient.interceptors.request.eject(requestInterceptor);
        };
    }, [user?.userName]);

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