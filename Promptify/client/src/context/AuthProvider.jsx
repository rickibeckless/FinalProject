import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import LoadingScreen from '../components/global/LoadingScreen';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    async function fetchUser(token) {
        if (token !== null) {
            try {
                const decoded = jwtDecode(token);
                const response = await fetch(`/api/users/${decoded.id}`);
                const data = await response.json();

                if (response.ok) {
                    setUser(data[0]);
                    localStorage.setItem("token", token);
                } else {
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                localStorage.removeItem("token");
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setAuthLoading(false);
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        let validToken = false;

        if (token) {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                localStorage.removeItem("token");
            } else {
                validToken = true;
            }
        }

        if (validToken) {
            fetchUser(token);
        } else {
            setAuthLoading(false);
        }
    }, []);

    const login = (token) => {
        setAuthLoading(true);
        fetchUser(token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        fetchUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, authLoading }}>
            {authLoading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
}

export default AuthContext;