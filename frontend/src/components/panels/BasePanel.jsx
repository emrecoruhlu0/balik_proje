import React from 'react';
import Modal from '../ui/Modal';
import styles from './styles.module.css';

const BasePanel = ({ 
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '800px',
  className = '',
  fixedSize = false,
  noScroll = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      className={className}
      fixedSize={fixedSize}
      noScroll={noScroll}
    >
      <div className={styles.panelContent}>
        {children}
      </div>
    </Modal>
  );
};

export default BasePanel;





