import React from 'react';

interface LoadingStateProps {
    message?: string;
    className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    message = "Loading...",
    className = "min-h-[400px]"
}) => (
    <div className={`flex flex-col items-center justify-center p-12 bg-white ${className}`}>
        <div className="w-8 h-8 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-4"></div>
        <div className="text-[12px] font-bold tracking-widest uppercase text-gray-400">{message}</div>
    </div>
);

export default LoadingState;

