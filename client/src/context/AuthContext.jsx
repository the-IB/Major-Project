// src/context/AuthContext.js
import { createContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password
            });

            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.error || 'Login failed' };
        }
    };

    const register = async (username, password, role) => {
        try {
            await axios.post('http://localhost:5000/register', {
                username,
                password,
                role
            });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Check for user in localStorage on initial load
    useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};