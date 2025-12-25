import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import ActiveRentalCard from '../rental/ActiveRentalCard';
import PaymentModal from '../../modals/PaymentModal';
import { formatCurrency } from '../../../utils/format';
import { completeBoatRental, completeEquipmentRental } from '../../../api/api';
import toast from 'react-hot-toast';
import styles from './styles.module.css';

const RentalsTab = ({ myActiveRentals, calculateCurrentCost, onRefresh }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const totalBoatCost = myActiveRentals.boats.reduce((sum, rental) => {
    return sum + calculateCurrentCost(rental, rental.price_per_hour || 0);
  }, 0);

  const totalEquipmentCost = myActiveRentals.equipment.reduce((sum, rental) => {
    return sum + calculateCurrentCost(rental, rental.price_per_hour || 0);
  }, 0);

  const formatTimeTR = (dateString) => {
    if (!dateString) return '';
    const dateValue = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(dateValue).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Kiralamaları bitir (ödeme modalı olmadan)
  const handleCompleteAllRentals = async () => {
    if (myActiveRentals.boats.length === 0 && myActiveRentals.equipment.length === 0) {
      toast.error('Bitirilecek aktif kiralama bulunmuyor.');
      return;
    }

    if (!window.confirm('Tüm aktif kiralamaları bitirmek istediğinize emin misiniz?\n\nNot: Ödeme kaydı otomatik olarak oluşturulacaktır.')) {
      return;
    }

    setIsCompleting(true);
    try {
      const promises = [];

      // Tüm tekne kiralamalarını bitir
      for (const rental of myActiveRentals.boats) {
        promises.push(completeBoatRental(rental.rental_id));
      }

      // Tüm ekipman kiralamalarını bitir
      for (const rental of myActiveRentals.equipment) {
        promises.push(completeEquipmentRental(rental.equipment_rental_id));
      }

      const results = await Promise.all(promises);
      
      let totalAmount = 0;
      results.forEach(result => {
        if (result && result.total_price) {
          totalAmount += parseFloat(result.total_price);
        }
      });

      toast.success(`Tüm kiralamalar başarıyla bitirildi!\nToplam Tutar: ${formatCurrency(totalAmount)} ₺`);
      
      // Verileri yenile
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Kiralamalar bitirilirken bir hata oluştu.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Ödeme modalını aç
  const handleOpenPaymentModal = () => {
    if (myActiveRentals.boats.length === 0 && myActiveRentals.equipment.length === 0) {
      toast.error('Ödenecek aktif kiralama bulunmuyor.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  // Ödeme onaylandığında kiralamaları bitir
  const handleConfirmPayment = async (paymentMethod) => {
    try {
      const promises = [];

      // Tüm tekne kiralamalarını bitir
      for (const rental of myActiveRentals.boats) {
        promises.push(completeBoatRental(rental.rental_id));
      }

      // Tüm ekipman kiralamalarını bitir
      for (const rental of myActiveRentals.equipment) {
        promises.push(completeEquipmentRental(rental.equipment_rental_id));
      }

      const results = await Promise.all(promises);
      
      let totalAmount = 0;
      results.forEach(result => {
        if (result && result.total_price) {
          totalAmount += parseFloat(result.total_price);
        }
      });

      toast.success(`Ödeme başarıyla tamamlandı!\nÖdeme Yöntemi: ${paymentMethod === 'cash' ? '💵 Nakit' : '💳 Kart'}\nToplam Tutar: ${formatCurrency(totalAmount)} ₺`);
      
      // Verileri yenile
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Ödeme sırasında bir hata oluştu.');
      throw err;
    }
  };

  return (
    <div className={styles.rentalsContainer}>
      <h4 className={styles.sectionTitle}>🛶 Aktif Kiralamalarım</h4>

      {/* Tekneler */}
      {myActiveRentals.boats.length > 0 && (
        <div>
          <h5 className={styles.subsectionTitle}>Tekneler</h5>
          <div className={styles.rentalsList}>
            {myActiveRentals.boats.map((rental) => (
              <ActiveRentalCard
                key={rental.rental_id}
                rental={rental}
                type="boat"
                calculateCurrentCost={calculateCurrentCost}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ekipmanlar */}
      {myActiveRentals.equipment.length > 0 && (
        <div>
          <h5 className={styles.subsectionTitle}>Ekipmanlar</h5>
          <div className={styles.rentalsList}>
            {myActiveRentals.equipment.map((rental) => (
              <ActiveRentalCard
                key={rental.equipment_rental_id}
                rental={rental}
                type="equipment"
                calculateCurrentCost={calculateCurrentCost}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toplam */}
      {(myActiveRentals.boats.length > 0 || myActiveRentals.equipment.length > 0) && (
        <>
          <Card className={styles.totalCard}>
            <div className={styles.totalContent}>
              <strong className={styles.totalLabel}>Toplam Anlık Maliyet:</strong>
              <strong className={styles.totalAmount}>
                {formatCurrency(totalBoatCost + totalEquipmentCost)} ₺
              </strong>
            </div>
          </Card>

          {/* Butonlar */}
          <div className={styles.actionButtons}>
            <Button
              variant="secondary"
              onClick={handleCompleteAllRentals}
              disabled={isCompleting}
              className={styles.completeButton}
            >
              {isCompleting ? '⏳ Bitiriliyor...' : '✅ Kiralamaları Bitir'}
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenPaymentModal}
              disabled={isCompleting}
              className={styles.payButton}
            >
              💳 Ödeme Yap
            </Button>
          </div>
        </>
      )}

      {myActiveRentals.boats.length === 0 && myActiveRentals.equipment.length === 0 && (
        <p className={styles.emptyMessage}>Aktif kiralamanız bulunmuyor.</p>
      )}

      {/* Ödeme Modalı */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalBoatCost + totalEquipmentCost}
        onConfirm={handleConfirmPayment}
        rentalDetails={myActiveRentals}
        calculateCurrentCost={calculateCurrentCost}
      />
    </div>
  );
};

export default RentalsTab;





