/* eslint-disable react-refresh/only-export-components */
// /* eslint-disable react-refresh/only-export-components */
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { authAPI } from '../Api/authApi';

// const AuthContext = createContext();

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) throw new Error('useAuth must be used within an AuthProvider');
//     return context;
// };

// export const AuthProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // ✅ Initialize Auth from localStorage
//     useEffect(() => {
//         try {
//             const token = localStorage.getItem('token');
//             const userData = localStorage.getItem('user');
//             if (token && userData) {
//                 setIsAuthenticated(true);
//                 setUser(JSON.parse(userData));
//             }
//         } catch (error) {
//             console.error('Auth init error:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // ✅ Login — overwrite everything from new user
//     const login = (userData, token) => {
//         try {
//             if (!token) throw new Error('No authentication token received');

//             // Overwrite any existing user completely
//             localStorage.setItem('token', token);
//             localStorage.setItem('user', JSON.stringify(userData));

//             setIsAuthenticated(true);
//             setUser(userData);

//             console.log('✅ Login successful - user updated:', userData);
//         } catch (error) {
//             console.error('Login error:', error);
//             throw error;
//         }
//     };

//     // ✅ Logout — clear all user-related data
//     const logout = () => {
//         try {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             setIsAuthenticated(false);
//             setUser(null);
//             console.log('✅ Logout successful');
//         } catch (error) {
//             console.error('Logout error:', error);
//         }
//     };

//     // ✅ Update profile (photo, name, etc.)
//     const updateProfile = async (profileData) => {
//         try {
//             const response = await authAPI.updateProfile(profileData);

//             if (response.data.success) {
//                 const updatedUser = response.data.user;

//                 // Update both localStorage and state
//                 localStorage.setItem('user', JSON.stringify(updatedUser));
//                 setUser(updatedUser);

//                 console.log('✅ Profile updated in AuthContext');
//                 return updatedUser;
//             } else {
//                 throw new Error(response.data.message || 'Failed to update profile');
//             }
//         } catch (error) {
//             console.error('❌ Update profile error:', error);
//             throw error;
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateProfile, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };




// context/AuthContext.jsx - WEBSITE - COMPLETE FIXED
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../Api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Initialize Auth from localStorage and fetch fresh data
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                
                if (token && userData) {
                    const parsedUser = JSON.parse(userData);
                    setIsAuthenticated(true);
                    setUser(parsedUser);
                    
                    // ✅ IMPORTANT: Fetch fresh user data from server
                    await refreshUserData();
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // ✅ REFRESH USER DATA FROM SERVER
    const refreshUserData = async () => {
        try {
            console.log('🔄 Refreshing user data from server...');
            const response = await authAPI.getCurrentUser();
            
            if (response.data.success) {
                const freshUserData = response.data.user;
                console.log('✅ Fresh user data received:', freshUserData.name);
                
                // Update localStorage
                localStorage.setItem('user', JSON.stringify(freshUserData));
                
                // Update state
                setUser(freshUserData);
                
                return freshUserData;
            }
        } catch (error) {
            console.error('❌ Failed to refresh user data:', error);
        }
    };

    // ✅ Login
    const login = (userData, token) => {
        try {
            if (!token) throw new Error('No authentication token received');

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setIsAuthenticated(true);
            setUser(userData);

            console.log('✅ Login successful - user:', userData.name);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // ✅ Logout
    const logout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // ✅ Update profile
    const updateProfile = async (profileData) => {
        try {
            console.log('🔄 Updating profile via API...');
            
            const response = await authAPI.updateProfile(profileData);

            if (response.data.success) {
                const updatedUser = response.data.user;
                console.log('✅ Profile updated successfully:', updatedUser.name);

                // Update localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Update state
                setUser(updatedUser);

                return updatedUser;
            } else {
                throw new Error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('❌ Update profile error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            login, 
            logout, 
            updateProfile,
            refreshUserData, // ✅ EXPORT refresh function
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};