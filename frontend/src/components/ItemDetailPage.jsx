import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import Notification from './Notification';

const ItemDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    const fetchItemDetails = async () => {
        try {
            setLoading(true);
            const { data, error: apiError } = await itemsAPI.getItem(id);

            if (apiError) {
                setError(apiError);
                showNotification(apiError, 'error');
            } else {
                setItem(data.item);
            }
        } catch (err) {
            setError('Failed to fetch item details');
            showNotification('Failed to fetch item details', 'error');
            console.error('Error fetching item details:', err);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const closeNotification = () => {
        setNotification(null);
    };

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const handleEdit = () => {
        // Navigate to edit page
        navigate(`/items/${id}/edit`);
    };

    const handleDelete = async () => {
        // Confirm deletion
        const confirmDelete = window.confirm('Are you sure you want to delete this item? This action cannot be undone.');

        if (confirmDelete) {
            try {
                const { error: apiError } = await itemsAPI.deleteItem(id);

                if (apiError) {
                    showNotification(apiError, 'error');
                } else {
                    showNotification('Item deleted successfully', 'success');
                    // Redirect to dashboard after successful deletion
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                }
            } catch (err) {
                showNotification('Failed to delete item', 'error');
                console.error('Error deleting item:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading item details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Item Not Found</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                        >
                            Back to Previous Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Item Not Found</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">The requested item could not be found.</p>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                        >
                            Back to Previous Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            {/* Notification */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-900 dark:bg-gray-800 p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{item.title}</h1>
                                <div className="mt-2 flex items-center">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${item.type === 'lost'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                            : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                        }`}>
                                        {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                                    </span>
                                    <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${item.status === 'open'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleEdit}
                                    className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors duration-200"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500 transition-colors duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    {item.imageUrl && (
                        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex justify-center">
                                <img
                                    src={`http://localhost:5000${item.imageUrl}`}
                                    alt={item.title}
                                    className="max-w-full h-auto max-h-96 object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    {/* Item Details */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {item.description || 'No description provided.'}
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <svg className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{item.locationText || 'Location not specified'}</span>
                                    </div>

                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <svg className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span>
                                            {item.date
                                                ? `Occurred on: ${new Date(item.date).toLocaleDateString()}`
                                                : 'Date not specified'}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <svg className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Reported on: {new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Owner Information */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reported By</h2>
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {item.ownerId?.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {item.ownerId?.name || 'Unknown User'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {item.ownerId?.email || 'Email not available'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage;