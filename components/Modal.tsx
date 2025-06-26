import React, { ReactNode } from 'react';
import { XMarkIcon, COMMON_BUTTON_FOCUS_CLASSES } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  
  if (size === 'lg') sizeClasses.lg = 'max-w-2xl';
  if (size === 'xl') sizeClasses.xl = 'max-w-4xl';


  return (
    <div
      className="fixed inset-0 bg-[#121820] bg-opacity-80 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out" // Darker, more intense blur
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        // Apply modal-content-style for background, border, shadow, rounded corners from index.html global styles
        className={`modal-content-style ${sizeClasses[size]} w-full transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-[var(--border-color)] flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className={`text-[var(--text-secondary)] hover:text-[var(--accent1)] transition-colors rounded-full p-1.5 ${COMMON_BUTTON_FOCUS_CLASSES}`}
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 md:p-5 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;