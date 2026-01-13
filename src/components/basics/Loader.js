import React from 'react';

const Loader = ({ text = "Cargando...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center w-full h-full min-h-[50vh] ${className}`}>
      <div className="relative flex items-center justify-center mb-4">
        {/* Outer pulsing ring */}
        <div className="absolute w-16 h-16 border-4 border-blue-100 rounded-full animate-ping opacity-75"></div>
        
        {/* Inner spinning ring */}
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute w-16 h-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      
      {text && (
        <p className="text-gray-500 font-medium text-lg animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
