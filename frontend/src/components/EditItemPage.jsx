import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import Notification from './Notification';

const EditItemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState(null);

    // Form state
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('open');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);

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
                // Populate form fields
                setItemName(data.item.title);
                setDescription(data.item.description || '');
                setLocation(data.item.locationText || '');
                setDate(data.item.date || '');
                setStatus(data.item.status || 'open');
                setExistingImage(data.item.imageUrl);
                setImagePreview(data.item.imageUrl ? `http://localhost:5000${data.item.imageUrl}` : null);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.match('image.*')) {
                showNotification('Please select a valid image file (JPEG, PNG, GIF)', 'error');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size must be less than 5MB', 'error');
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

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        setExistingImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Validate required fields
        if (!itemName.trim()) {
            showNotification('Item name is required', 'error');
            setSaving(false);
            return;
        }

        if (!description.trim()) {
            showNotification('Description is required', 'error');
            setSaving(false);
            return;
        }

        try {
            // Create FormData for update
            const formData = new FormData();
            formData.append('title', itemName.trim());
            formData.append('description', description.trim());
            formData.append('locationText', location.trim());
            formData.append('status', status);

            if (date) {
                formData.append('date', date);
            }

            // Only append image if a new one is selected
            if (image) {
                formData.append('image', image);
            }

            const { data, error: apiError } = await itemsAPI.updateItem(id, formData);

            if (apiError) {
                showNotification(apiError, 'error');
            } else {
                showNotification('Item updated successfully!', 'success');
                // Redirect to item detail page after successful update
                setTimeout(() => {
                    navigate(`/items/${id}`);
                }, 2000);
            }
        } catch (err) {
            showNotification('Failed to update item', 'error');
            console.error('Error updating item:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/items/${id}`);
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                        >
                            Back to Item
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
                            onClick={handleCancel}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                        >
                            Back to Dashboard
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

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={handleCancel}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Item
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Item</h1>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Name *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Enter item name"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                rows="4"
                                placeholder="Describe the item in detail..."
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo</label>
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
                                {(image || existingImage) && (
                                    <button
                                        type="button"
                                        className="text-sm text-red-600 hover:text-red-800 transition duration-200 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                        onClick={handleRemoveImage}
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Adding a photo can help with matching. Supported formats: JPEG, PNG, GIF. Max size: 5MB.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 flex items-center"
                            >
                                {saving ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditItemPage;