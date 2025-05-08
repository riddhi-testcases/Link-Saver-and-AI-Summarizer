import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-md shadow-sm
            text-gray-900 dark:text-white
            bg-white dark:bg-gray-700
            border-gray-300 dark:border-gray-600
            focus:border-blue-500 dark:focus:border-blue-400
            focus:ring-blue-500 dark:focus:ring-blue-400
            placeholder-gray-400 dark:placeholder-gray-300
            sm:text-sm
            ${error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;