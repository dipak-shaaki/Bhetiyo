import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center text-gray-600 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} BHETIYO. Helping people reconnect with their lost belongings.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;