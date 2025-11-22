import React from 'react';

const Notification = ({ message, type, onClose }) => {
    // Determine styling based on notification type
    const getNotificationStyle = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 border-green-400 text-green-700';
            case 'error':
                return 'bg-red-100 border-red-400 text-red-700';
            case 'warning':
                return 'bg-yellow-100 border-yellow-400 text-yellow-700';
            case 'info':
                return 'bg-blue-100 border-blue-400 text-blue-700';
            default:
                return 'bg-gray-100 border-gray-400 text-gray-700';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
            <div className={`${getNotificationStyle()} border px-4 py-3 rounded-lg shadow-lg max-w-md`}>
                <div className="flex items-start">
                    <div className="flex-1">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notification;