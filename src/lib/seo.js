// src/lib/seo.js
// Generador de datos estructurados JSON-LD y Meta Tags para SEO masivo en Google

/**
 * Genera el script JSON-LD (Schema.org) para rich snippets de resultados de sorteos en Google
 * @param {Object} lottery - Objeto de datos de lotería
 * @returns {Object} JSON-LD Schema
 */
export function generateLotteryJsonLd(lottery) {
  if (!lottery || !lottery.latestDraw) return null;

  const { name, country, latestDraw, jackpotFormatted, nextDrawDateFormatted } = lottery;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Sorteo Oficial ${name} N° ${latestDraw.drawNumber}`,
    startDate: latestDraw.drawDateFormatted,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: `https://lotto-web.com/${lottery.countrySlug || 'us'}/${lottery.slug}`,
    },
    description: `Resultados del sorteo N° ${latestDraw.drawNumber} de ${name}. Jackpot actual: ${jackpotFormatted}. Próximo sorteo: ${nextDrawDateFormatted}.`,
    organizer: {
      '@type': 'Organization',
      name: `Lotería Oficial de ${country?.name || 'EE. UU.'}`,
    },
  };
}
