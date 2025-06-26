import React, { ReactNode } from 'react';
import Modal from '../Modal';
import { COMMON_BUTTON_FOCUS_CLASSES } from '../../constants';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-sm text-[var(--text-secondary)] mb-6">{message}</div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className={`px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>Confirm</button> {/* Stronger red for confirm */}
      </div>
    </Modal>
  );
};

export default ConfirmationModal;