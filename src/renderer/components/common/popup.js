import React from 'react';
import { Modal } from 'react-overlays';

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.message
 * @param {{label: string, color: string, onClick: () => void}[]} props.buttons
 */
const Popup = ({ title, message, buttons }) => (
  <Modal show>
    <div className="title">{title}</div>
    <div className="message">{message}</div>

    <div className="action-bar">
      {buttons.map(btn => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.onClick}
        >
          {btn.label}
        </button>
      ))}
    </div>
  </Modal>
);

export default Popup;
