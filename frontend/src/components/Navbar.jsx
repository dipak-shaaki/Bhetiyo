import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('User');
    const navigate = useNavigate();

    // Check authentication status on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            setIsLoggedIn(true);
            try {
                const userData = JSON.parse(user);
                setUserName(userData.name || 'User');
            } catch (e) {
                console.error('Error parsing user data:', e);
                setUserName('User');
            }
        } else {
            setIsLoggedIn(false);
            setUserName('User');
        }
    }, []);

    const handleLoginClick = () => {
        // Redirect to login page
        navigate('/signin');
    };

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link to="/" className="text-2xl font-bold text-black dark:text-white">BHETIYO</Link>
                </div>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />

                    {isLoggedIn ? (
                        <UserDropdown userName={userName} />
                    ) : (
                        <button
                            onClick={handleLoginClick}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;