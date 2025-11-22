import React from 'react';

const Stats = () => {
    const statsData = [
        { value: '1000+', label: 'Items Recovered' },
        { value: '500+', label: 'Happy Users' },
        { value: '95%', label: 'Match Accuracy' }
    ];

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statsData.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 text-center transition-all duration-300 hover:shadow-md dark:hover:shadow-gray-700"
                    >
                        <div className="text-4xl font-bold text-black dark:text-white">{stat.value}</div>
                        <div className="text-gray-600 dark:text-gray-300 mt-2">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stats;