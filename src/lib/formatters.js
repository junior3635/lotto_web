// src/lib/formatters.js
// Utilidades universales para formatear montos, monedas, jackpots y fechas en español

/**
 * Formatea montos grandes de jackpot a texto legible (ej: 360000000 -> "$360 MILLONES")
 * @param {number|string} amount - Monto numérico
 * @param {string} currencyCode - Código de moneda ("USD", "EUR", "MXN")
 * @returns {string}
 */
export function formatJackpot(amount, currencyCode = 'USD') {
  if (!amount || isNaN(Number(amount))) return 'Por confirmar';

  const num = Number(amount);
  const symbolMap = { USD: '$', EUR: '€', MXN: '$', GBP: '£', COP: '$' };
  const symbol = symbolMap[currencyCode] || '$';

  if (num >= 1_000_000_000) {
    const billions = (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '');
    return `${symbol}${billions} MIL MILLONES`;
  }

  if (num >= 1_000_000) {
    const millions = (num / 1_000_000).toFixed(2).replace(/\.00$/, '');
    return `${symbol}${millions} MILLONES`;
  }

  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formatea fechas en formato amigable y legible para SEO y usuarios
 * @param {Date|string} dateInput
 * @param {boolean} includeTime
 * @returns {string}
 */
export function formatDateSpanish(dateInput, includeTime = false) {
  if (!dateInput) return 'Fecha no disponible';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Fecha inválida';

  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };

  const formatted = new Intl.DateTimeFormat('es-ES', options).format(date);
  // Capitaliza la primera letra del día
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formatea moneda estándar para tablas de premios (ej: 1000000 -> "$1,000,000")
 * @param {number|string} amount
 * @param {string} currencyCode
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '-';
  
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
