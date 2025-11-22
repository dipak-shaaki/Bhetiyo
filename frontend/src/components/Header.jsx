import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
                        BHETIYO
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};

export default Header;