// Para miktarını Türkiye formatına çevir
// Binlik ayırıcı: nokta (.), Ondalık ayırıcı: virgül (,)
// Örnek: 35913.00 → 35.913,00
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,00';
  }

  const num = parseFloat(amount);
  const fixed = num.toFixed(2);
  
  // Ondalık kısmı ayır
  const parts = fixed.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '00';

  // Binlik ayırıcı ekle (nokta)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Ondalık ayırıcıyı virgül yap
  return `${formattedInteger},${decimalPart}`;
};

