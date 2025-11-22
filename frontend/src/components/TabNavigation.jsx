import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'lost', label: 'Lost Items' },
        { id: 'found', label: 'Found Items' }
    ];

    return (
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`py-3 px-6 font-medium text-lg transition-colors duration-200 ${activeTab === tab.id
                            ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;