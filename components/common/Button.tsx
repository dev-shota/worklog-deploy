
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
      break;
    case 'secondary':
      variantStyle = "text-black bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500";
      break;
    case 'danger':
      variantStyle = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500";
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;