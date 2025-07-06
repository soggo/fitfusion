import React from 'react';
import clsx from 'clsx';

const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-gray-900 text-white',
    secondary: 'bg-gray-200 text-gray-900',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    new: 'bg-purple-100 text-purple-800',
    sale: 'bg-red-100 text-red-800',
  };
  
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1 text-base',
  };
  
  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge; 