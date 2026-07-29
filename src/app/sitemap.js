import prisma from '../lib/prisma';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lotto-web.com';

  const countries = await prisma.country.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  const lotteries = await prisma.lottery.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      state: {
        select: { country: { select: { slug: true } } },
      },
    },
  });

  const states = await prisma.state.findMany({
    where: { isActive: true, code: { not: 'NAT' } },
    select: {
      slug: true,
      country: { select: { slug: true } },
    },
  });

  const draws = await prisma.draw.findMany({
    where: { status: 'COMPLETED' },
    select: {
      id: true,
      lottery: {
        select: {
          slug: true,
          state: { select: { country: { select: { slug: true } } } },
        },
      },
    },
    orderBy: { drawDate: 'desc' },
    take: 50,
  });

  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    ...countries.map((c) => ({
      url: `${baseUrl}/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    })),
    ...lotteries.map((l) => ({
      url: `${baseUrl}/${l.state.country.slug}/${l.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    })),
    ...states.map((s) => ({
      url: `${baseUrl}/${s.country.slug}/estado/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })),
    ...draws.map((d) => ({
      url: `${baseUrl}/${d.lottery.state.country.slug}/${d.lottery.slug}/sorteo/${d.id}`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.7,
    })),
  ];

  return routes;
}
