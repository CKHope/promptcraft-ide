import React from 'react';

interface GlobalLoaderProps {
  message?: string | null;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ message }) => {
  return (
    <div className="flickering-grid-loader-overlay" role="alert" aria-live="assertive">
      <div className="flickering-grid">
        <div className="flicker-dot"></div><div className="flicker-dot"></div><div className="flicker-dot"></div><div className="flicker-dot"></div>
        <div className="flicker-dot"></div><div className="flicker-dot"></div><div className="flicker-dot"></div><div className="flicker-dot"></div>
        <div className="flicker-dot"></div><div className="flicker-dot"></div><div className="flicker-dot"></div><div className="flicker-dot"></div>
        <div className="flicker-dot"></div><div className="flicker-dot"></div><div className="flicker-dot"></div><div className="flicker-dot"></div>
      </div>
      {message && <p className="text-lg font-medium mt-4">{message}</p>}
    </div>
  );
};

export default GlobalLoader;