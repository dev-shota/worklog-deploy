
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string; // Add placeholder to the interface
}

const Select: React.FC<SelectProps> = ({ label, id, options, error, className, placeholder, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-black mb-1">
        {label}
      </label>
      <select
        id={id}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm text-black ${className || ''}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled selected={props.value === '' || props.value === undefined}>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;