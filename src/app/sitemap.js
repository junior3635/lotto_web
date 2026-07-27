// src/app/sitemap.js
// Generador dinámico de Sitemap XML para SEO masivo en Google Search Console

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lotto-web.com';

  // Rutas dinámicas de países
  const countries = ['us', 'es', 'mx'];

  // Rutas dinámicas de loterías
  const lotteries = [
    { country: 'us', slug: 'powerball' },
    { country: 'us', slug: 'mega-millions' },
    { country: 'us', slug: 'florida-lotto' },
    { country: 'es', slug: 'euromillones' },
    { country: 'mx', slug: 'melate' },
  ];

  // Rutas dinámicas por estado
  const states = [
    { country: 'us', slug: 'florida' },
    { country: 'us', slug: 'texas' },
    { country: 'us', slug: 'california' },
  ];

  // Sorteos históricos individuales (SEO Long-Tail)
  const draws = [
    { country: 'us', lottery: 'powerball', drawId: '3912' },
    { country: 'us', lottery: 'mega-millions', drawId: '2541' },
  ];

  const routes = [
    // 1. Home Base
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    // 2. Dashboards por País
    ...countries.map((code) => ({
      url: `${baseUrl}/${code}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    })),
    // 3. Detalle por Lotería
    ...lotteries.map((l) => ({
      url: `${baseUrl}/${l.country}/${l.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    })),
    // 4. Páginas por Estado
    ...states.map((s) => ({
      url: `${baseUrl}/${s.country}/estado/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })),
    // 5. Sorteos Individuales
    ...draws.map((d) => ({
      url: `${baseUrl}/${d.country}/${d.lottery}/sorteo/${d.drawId}`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.7,
    })),
  ];

  return routes;
}
