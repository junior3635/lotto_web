// src/app/api/revalidate/route.js
// API Route de Revalidación bajo Demanda (On-Demand ISR + Redis Cache Purge)

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidateLotteryCache } from '../../../services/lotteryService';

/**
 * Endpoint para invalidar la caché de páginas e In-Memory/Redis cuando se registra un nuevo sorteo.
 *
 * Ejemplo de llamada por Webhook o Scraper:
 * GET /api/revalidate?secret=dev_secret_revalidate_12345&country=us&lottery=powerball&path=/us/powerball
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const country = searchParams.get('country') || 'us';
  const lottery = searchParams.get('lottery');
  const path = searchParams.get('path') || `/${country}`;

  // 1. Verificación de Seguridad (Token Secreto)
  const expectedSecret = process.env.REVALIDATE_SECRET || 'dev_secret_revalidate_12345';
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { message: 'Token de revalidación inválido o no provisto' },
      { status: 401 }
    );
  }

  try {
    // 2. Revalidar Caché en Next.js (On-Demand ISR)
    revalidatePath(path);

    // Si se especifica una lotería particular, revalidar también su ruta de detalle
    if (lottery) {
      revalidatePath(`/${country}/${lottery}`);
    }

    // 3. Purgar la Caché de Redis / Memoria mediante el servicio
    if (country && lottery) {
      await invalidateLotteryCache(country, lottery);
    }

    return NextResponse.json({
      revalidated: true,
      country,
      lottery: lottery || 'todas',
      path,
      now: Date.now(),
      message: `Caché revalidada con éxito para ${path}`,
    });
  } catch (error) {
    console.error('[Revalidate Error] Error al revalidar la página:', error);
    return NextResponse.json(
      { message: 'Error interno revalidando la caché', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Soporte para solicitudes POST desde Webhooks (Payload JSON)
  try {
    const body = await request.json();
    const { secret, country = 'us', lottery, path = `/${country}` } = body;

    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev_secret_revalidate_12345';
    if (secret !== expectedSecret) {
      return NextResponse.json({ message: 'Token no válido' }, { status: 401 });
    }

    revalidatePath(path);
    if (lottery) {
      revalidatePath(`/${country}/${lottery}`);
      await invalidateLotteryCache(country, lottery);
    }

    return NextResponse.json({
      revalidated: true,
      country,
      lottery: lottery || 'todas',
      path,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error procesando solicitud POST', error: error.message }, { status: 400 });
  }
}
