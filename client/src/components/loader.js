import React from 'react';

const Loader = ({ message = 'جاري التحميل...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">{message}</p>
        </div>
    );
};

export default Loader;