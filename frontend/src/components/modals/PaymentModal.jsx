import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';
import styles from './styles.module.css';

const PaymentModal = ({ isOpen, onClose, totalAmount, onConfirm, rentalDetails, calculateCurrentCost }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(paymentMethod);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="💳 Ödeme Onayı" 
      maxWidth="500px"
      className={styles.paymentModal}
    >
      <div className={styles.paymentContent}>
        {/* Özet Bilgiler */}
        <div className={styles.paymentSummary}>
          <h3 className={styles.paymentSummaryTitle}>Ödeme Özeti</h3>
          
          {rentalDetails && rentalDetails.boats && rentalDetails.boats.length > 0 && (
            <div className={styles.rentalSection}>
              <div className={styles.rentalSectionTitle}>🛶 Tekneler</div>
              {rentalDetails.boats.map((rental, idx) => {
                const cost = calculateCurrentCost 
                  ? calculateCurrentCost(rental, rental.price_per_hour || 0)
                  : (rental.estimated_price || 0);
                return (
                  <div key={rental.rental_id || idx} className={styles.rentalItem}>
                    <span>{rental.boat_name || `Tekne #${rental.boat_id}`}</span>
                    <span className={styles.rentalPrice}>
                      {formatCurrency(cost)} ₺
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {rentalDetails && rentalDetails.equipment && rentalDetails.equipment.length > 0 && (
            <div className={styles.rentalSection}>
              <div className={styles.rentalSectionTitle}>🎣 Ekipmanlar</div>
              {rentalDetails.equipment.map((rental, idx) => {
                const cost = calculateCurrentCost 
                  ? calculateCurrentCost(rental, rental.price_per_hour || 0)
                  : (rental.estimated_price || 0);
                return (
                  <div key={rental.equipment_rental_id || idx} className={styles.rentalItem}>
                    <span>{rental.equipment_name || `Ekipman #${rental.equipment_id}`}</span>
                    <span className={styles.rentalPrice}>
                      {formatCurrency(cost)} ₺
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.totalSection}>
            <div className={styles.totalLabel}>Toplam Tutar</div>
            <div className={styles.totalValue}>{formatCurrency(totalAmount)} ₺</div>
          </div>
        </div>

        {/* Ödeme Yöntemi Seçimi */}
        <div className={styles.paymentMethodSection}>
          <label className={styles.paymentMethodLabel}>Ödeme Yöntemi</label>
          <div className={styles.paymentMethodOptions}>
            <label className={styles.paymentMethodOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className={styles.paymentMethodIcon}>💵</span>
              <span>Nakit</span>
            </label>
            <label className={styles.paymentMethodOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className={styles.paymentMethodIcon}>💳</span>
              <span>Kart</span>
            </label>
          </div>
        </div>

        {/* Butonlar */}
        <div className={styles.paymentActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isProcessing}
            className={styles.cancelButton}
          >
            İptal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={isProcessing}
            className={styles.confirmPaymentButton}
          >
            {isProcessing ? '⏳ İşleniyor...' : `💳 ${formatCurrency(totalAmount)} ₺ Öde`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;

