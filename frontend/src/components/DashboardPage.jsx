import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';

const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            // Redirect to login if not authenticated
            navigate('/signin');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Fetch user's items
            fetchUserItems();
        } catch (err) {
            console.error('Error parsing user data:', err);
            navigate('/signin');
        }
    }, [navigate]);

    const fetchUserItems = async () => {
        try {
            setLoading(true);
            const { data, error: apiError } = await itemsAPI.getUserItems();

            if (apiError) {
                // Handle session expiration
                if (apiError === 'Session expired. Please log in again.') {
                    alert('Your session has expired. Please log in again.');
                    return;
                }

                setError(apiError);
            } else {
                setItems(data.items || []);
            }
        } catch (err) {
            setError('Failed to fetch items');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Remove token and user data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to home page
        navigate('/');
    };

    const handleViewItem = (itemId) => {
        // Navigate to item detail page
        navigate(`/items/${itemId}`);
    };

    const handleReportNewItem = () => {
        navigate('/');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 dark:text-gray-300 hidden sm:block">
                            Hello, {user.name}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Your Reported Items
                        </h2>
                        <button
                            onClick={handleReportNewItem}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Report New Item
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 mb-6">
                            <div className="text-sm text-red-700">
                                {error}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your items...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No items reported</h3>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                You haven't reported any lost or found items yet.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={handleReportNewItem}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Report your first item
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <div key={item._id} className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    {item.imageUrl && (
                                        <img
                                            src={`http://localhost:5000${item.imageUrl}`}
                                            alt={item.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'open'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        {item.description && (
                                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}
                                        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            {item.locationText || 'Location not specified'}
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                            {item.date ? new Date(item.date).toLocaleDateString() : 'Date not specified'}
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="mt-4">
                                            <button
                                                onClick={() => handleViewItem(item._id)}
                                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                                            >
                                                View details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Reporting Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {items.filter(item => item.type === 'lost').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Lost Items</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {items.filter(item => item.type === 'found').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Found Items</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {items.filter(item => item.status === 'open').length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Open Cases</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;