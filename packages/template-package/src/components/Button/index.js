import React from 'react';

export const Button = ({ children, ...props }) => {
  return (
    <button 
      className="flex items-center justify-center rounded bg-[#646cff] px-4 py-2 text-white hover:bg-[#535bf2]"
      {...props}
    >
      {children}
    </button>
  );
};