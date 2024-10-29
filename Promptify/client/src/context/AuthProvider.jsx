import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import LoadingScreen from '../components/global/LoadingScreen';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        async function fetchUser() {
            if (token) {
                const decoded = jwtDecode(token);
                const response = await fetch(`/api/users/${decoded.id}`);
                const data = await response.json();

                if (response.ok) {
                    setUser(data[0]);
                } else {
                    localStorage.removeItem("token");
                };
            };
        };

        fetchUser();
        setAuthLoading(false);
    }, [user, setUser]);

    const login = (token) => {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {authLoading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};

export default AuthContext;