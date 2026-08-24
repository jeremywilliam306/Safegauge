import { Api } from './Util/mock-api.js';
import { createContext, useContext, useState, useEffect} from 'react';
import { registerUnauthorizedHandler } from './Util/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children })
{
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // running the app when loading, confirms the token if valid
    // and Api.me() reject 401 if its expired

    useEffect(() => 
    {
        const saved = localStorage.getItem('user');
        if (!saved) return; //just to stay logged out, nothing to be restored
    
        const { token: savedToken } = JSON.parse(saved);

        Api.me(savedToken)
        .then((freshUser) =>
        {
            setToken(savedToken);
            setUser(freshUser);
        })
        .catch(() =>
        {
            localStorage.removeItem('user');
        });
        }, []);

    const login = async (username, password, rememberMe) =>
    {
        const {token, user} = await Api.login(username, password, { rememberMe });
        setToken(token);
        setUser(user);

        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify({ token, user }));
        }
    }

    const logout = async () =>
    {
        const currentToken = token;
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        await Api.logout(currentToken);
       
    }
    useEffect(() => {
        registerUnauthorizedHandler(logout);
    }, [logout]);
    
    const value =
    {
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
    };

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

