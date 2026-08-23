import { Api } from './Util/mock-api.js';
import { createContext, useContext, useState} from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children })
{

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const login = async (username, password, rememberMe) =>
    {
        const {token, user} = await Api.login(username, password, { rememberMe });
        setToken(token);
        setUser(user);

        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify({ token, user }));
        }
    }

    const logout = () =>
    {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        console.log('logging out');
    }

    const value =
    {
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

    export function useAuth()
{
    return useContext(AuthContext);
}
