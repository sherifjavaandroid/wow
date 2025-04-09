import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, message, actionLink, actionText }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 text-center">{message}</p>
            {actionLink && actionText && (
                <Link
                    to={actionLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    {actionText}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;