import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'green' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
        large: 'w-8 h-8'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        white: 'border-white',
        gray: 'border-gray-500'
    };

    return (
        <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
    );
};

export default LoadingSpinner;