import React from 'react';
import clsx from 'clsx';

const Loading = ({
  variant = 'spinner',
  size = 'md',
  text,
  className = '',
}) => {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };
  
  if (variant === 'spinner') {
    return (
      <div className={clsx('flex items-center justify-center', className)}>
        <div className="flex flex-col items-center space-y-2">
          <svg
            className={clsx('animate-spin text-gray-600', sizes[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {text && (
            <p className="text-sm text-gray-600">{text}</p>
          )}
        </div>
      </div>
    );
  }
  
  if (variant === 'dots') {
    return (
      <div className={clsx('flex items-center justify-center space-x-1', className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={clsx(
                'bg-gray-600 rounded-full animate-bounce',
                size === 'xs' && 'h-1 w-1',
                size === 'sm' && 'h-2 w-2',
                size === 'md' && 'h-3 w-3',
                size === 'lg' && 'h-4 w-4'
              )}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
        {text && (
          <p className="ml-2 text-sm text-gray-600">{text}</p>
        )}
      </div>
    );
  }
  
  if (variant === 'skeleton') {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default Loading; 