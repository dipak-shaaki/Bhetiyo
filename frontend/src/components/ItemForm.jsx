import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import Notification from './Notification';

const ItemForm = ({ activeTab, onSubmit }) => {
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.match('image.*')) {
                setError('Please select a valid image file (JPEG, PNG, GIF)');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }

            setImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Validate required fields
        if (!itemName.trim()) {
            setError('Item name is required');
            setLoading(false);
            return;
        }

        if (!description.trim()) {
            setError('Description is required');
            setLoading(false);
            return;
        }

        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login first to report an item.', 'error');
            navigate('/signin');
            setLoading(false);
            return;
        }

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('type', activeTab);
            formData.append('title', itemName.trim());
            formData.append('description', description.trim());

            if (location.trim()) {
                formData.append('locationText', location.trim());
            }

            if (date) {
                formData.append('date', date);
            }

            if (image) {
                formData.append('image', image);
            }

            const { data, error: apiError } = await itemsAPI.createItem(formData);

            if (apiError) {
                // Handle session expiration
                if (apiError === 'Session expired. Please log in again.') {
                    showNotification('Your session has expired. Please log in again.', 'error');
                    return;
                }

                setError(apiError);
                showNotification(apiError, 'error');
                setLoading(false);
                return;
            }

            // Call the onSubmit callback with the created item
            onSubmit(data.item);

            // Show success notification
            setSuccess(true);
            showNotification(
                `${activeTab === 'lost' ? 'Lost' : 'Found'} item reported successfully! Our AI will help match it with relevant items.`,
                'success'
            );

            // Reset form after a delay
            setTimeout(() => {
                setItemName('');
                setDescription('');
                setLocation('');
                setDate('');
                setImage(null);
                setImagePreview(null);
                setSuccess(false);
            }, 3000);

        } catch (err) {
            const errorMessage = 'An unexpected error occurred. Please try again.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            console.error('Item creation error:', err);
        }

        setLoading(false);
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const closeNotification = () => {
        setNotification(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {activeTab === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
            </h2>

            {/* Notification */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            {error && !notification && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                    <div className="text-sm text-red-700">
                        {error}
                    </div>
                </div>
            )}

            {success && !notification && (
                <div className="rounded-md bg-green-50 p-4 mb-4">
                    <div className="text-sm text-green-700">
                        {activeTab === 'lost' ? 'Lost item reported successfully!' : 'Found item reported successfully!'}
                        Our AI will help match it with relevant items.
                    </div>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Name *</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={activeTab === 'lost' ? "What did you lose?" : "What did you find?"}
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                    <textarea
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        rows="4"
                        placeholder={activeTab === 'lost' ? "Describe your lost item in detail..." : "Describe the found item in detail..."}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Where did this happen?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo (Optional)</label>
                    <div className="flex items-center space-x-6">
                        <label className="flex flex-col items-center justify-center w-36 h-36 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center px-2">Click to upload photo</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 5MB</p>
                                </div>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                        {image && (
                            <button
                                type="button"
                                className="text-sm text-red-600 hover:text-red-800 transition duration-200 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                onClick={() => {
                                    setImage(null);
                                    setImagePreview(null);
                                }}
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Adding a photo can help with matching. Supported formats: JPEG, PNG, GIF. Max size: 5MB.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-4 rounded-lg transition duration-300 mt-4 hover:bg-gray-800 dark:hover:bg-gray-200 transform hover:-translate-y-0.5 shadow-md disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    {loading ? `Reporting ${activeTab === 'lost' ? 'Lost' : 'Found'} Item...` : `Report ${activeTab === 'lost' ? 'Lost' : 'Found'} Item`}
                </button>
            </form>
        </div>
    );
};

export default ItemForm;