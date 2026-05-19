import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
                <div className="confirm-modal-title">{title}</div>
                <div className="confirm-modal-message">{message}</div>
                <div className="confirm-modal-actions">
                    <button className="confirm-btn-cancel" onClick={onCancel}>Cancelar</button>
                    <button className="confirm-btn-danger" onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;