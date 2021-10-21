import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

export const AuthContent = createContext({} as AuthContextData) 

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
}

type AuthContextData = {
    user: User | null;
    signInUrl: string;
    signOut: () => void
}

type AuthProvider = {
    children: ReactNode
}

type AuthResponse = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string;
    }
}
export function AuthProvider(props: AuthProvider) {

    const [user, setUser] = useState<User | null>(null)
    const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=76290edcec15b4ca1270`
    async function singnIn(githubCode: string) {
        const response = await api.post<AuthResponse>('authenticate', {
            code: githubCode,
        });
        const { token, user } = response.data;
        localStorage.setItem('@dowhile:token', token)
        
        api.defaults.headers.common.authorization = `Bearer ${token}`;

        setUser(user)

    }

    function signOut() {
        setUser(null)
        localStorage.removeItem("@dowhile:token")
    }
    useEffect(() =>{
        const token = localStorage.getItem('@dowhile:token')

        if(token) {
            api.defaults.headers.common.authorization = `Bearer ${token}`;
            api.get('profile').then( response =>{
                console.log(response.data)
            })
        }
    }, [])

    useEffect(() => {
        const url = window.location.href;
        const hasGithubCode = url.includes('?code=');

        if (hasGithubCode) {
            const [urlWithoutCode, githubCode] = url.split('?code=')
            window.history.pushState({}, '', urlWithoutCode);
            singnIn(githubCode)
        }
    }, [])

    return (
        <AuthContent.Provider value={{signInUrl, user, signOut}}>
            {props.children}
        </AuthContent.Provider>
    )
}