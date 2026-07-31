// src/app/api/revalidate/route.js
// API Route de Revalidación bajo Demanda (On-Demand ISR + Redis Cache Purge)
// Incluye endpoints de ingestión de datos de jurisdicción desde el archivo PR.

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidateLotteryCache } from '../../../services/lotteryService';
import { ingestJurisdictionData, getIngestionStats, clearJurisdictionData } from '../../../services/ingestionService';
import { ingestAllJsonFiles, getIngestionStatus as getJsonStatus } from '../../../services/jsonIngestionService';

/**
 * Endpoint para invalidar la caché de páginas e In-Memory/Redis cuando se registra un nuevo sorteo.
 *
 * Ejemplo de llamada por Webhook o Scraper:
 * GET /api/revalidate?secret=dev_secret_revalidate_12345&country=us&lottery=powerball&path=/us/powerball
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const action = searchParams.get('action');
  const country = searchParams.get('country') || 'us';
  const lottery = searchParams.get('lottery');
  const state = searchParams.get('state');
  const path = searchParams.get('path') || `/${country}`;

  // Acción de ingestión desde archivo PR
  if (action === 'ingest') {
    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev_secret_revalidate_12345';
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Token de revalidación inválido o no provisto' },
        { status: 401 }
      );
    }

    try {
      const results = await ingestJurisdictionData();
      return NextResponse.json({
        ingested: true,
        action: 'ingest',
        results,
        now: Date.now(),
      });
    } catch (error) {
      console.error('[Ingest Error] Error ingiriendo datos de jurisdicción:', error);
      return NextResponse.json(
        { message: 'Error interno ingiriendo datos', error: error.message },
        { status: 500 }
      );
    }
  }

  // Acción para obtener estadísticas de ingestión
  if (action === 'stats') {
    try {
      const stats = await getIngestionStats();
      return NextResponse.json({ stats });
    } catch (error) {
      return NextResponse.json(
        { message: 'Error obteniendo estadísticas', error: error.message },
        { status: 500 }
      );
    }
  }

  // Acción para limpiar datos de jurisdicción (útil para re-种子)
  if (action === 'clear') {
    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev_secret_revalidate_12345';
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Token de revalidación inválido o no provisto' },
        { status: 401 }
      );
    }

    try {
      const result = await clearJurisdictionData();
      return NextResponse.json({
        cleared: true,
        action: 'clear',
        result,
        now: Date.now(),
      });
    } catch (error) {
      console.error('[Clear Error] Error limpiando datos de jurisdicción:', error);
      return NextResponse.json(
        { message: 'Error interno limpiando datos', error: error.message },
        { status: 500 }
      );
    }
  }

  // Acción de ingestión de archivos JSON desde la carpeta json_responses
  if (action === 'ingest-json') {
    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev_secret_revalidate_12345';
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Token de revalidación inválido o no provisto' },
        { status: 401 }
      );
    }

    try {
      const result = await ingestAllJsonFiles();
      return NextResponse.json({
        ingested: true,
        action: 'ingest-json',
        result,
        now: Date.now(),
      });
    } catch (error) {
      console.error('[JSON Ingest Error] Error ingiriendo archivos JSON:', error);
      return NextResponse.json(
        { message: 'Error interno ingiriendo archivos JSON', error: error.message },
        { status: 500 }
      );
    }
  }

  // Acción para obtener el estado de los archivos JSON pendientes de procesar
  if (action === 'json-status') {
    try {
      const status = await getJsonStatus();
      return NextResponse.json({ jsonStatus: status, timestamp: Date.now() });
    } catch (error) {
      return NextResponse.json(
        { message: 'Error obteniendo estado JSON', error: error.message },
        { status: 500 }
      );
    }
  }

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
    if (country && lottery && state) {
      await invalidateLotteryCache(country, lottery, state);
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
    const { secret, action, country = 'us', lottery, state, path = `/${country}` } = body;

    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev_secret_revalidate_12345';
    if (secret !== expectedSecret) {
      return NextResponse.json({ message: 'Token no válido' }, { status: 401 });
    }

    // Acciones de ingestión
    if (action === 'ingest') {
      const results = await ingestJurisdictionData();
      return NextResponse.json({ ingested: true, action: 'ingest', results, timestamp: Date.now() });
    }

    if (action === 'clear') {
      const result = await clearJurisdictionData();
      return NextResponse.json({ cleared: true, action: 'clear', result, timestamp: Date.now() });
    }

    if (action === 'stats') {
      const stats = await getIngestionStats();
      return NextResponse.json({ stats, timestamp: Date.now() });
    }

    // Acción de ingestión de archivos JSON
    if (action === 'ingest-json') {
      const result = await ingestAllJsonFiles();
      return NextResponse.json({ ingested: true, action: 'ingest-json', result, timestamp: Date.now() });
    }

    if (action === 'json-status') {
      const status = await getJsonStatus();
      return NextResponse.json({ jsonStatus: status, timestamp: Date.now() });
    }

    revalidatePath(path);
    if (lottery) {
      revalidatePath(`/${country}/${lottery}`);
    }
    if (state && lottery) {
      revalidatePath(`/${country}/estado/${state}/${lottery}`);
    }

    if (country && lottery) {
      await invalidateLotteryCache(country, lottery);
    }
    if (country && lottery && state) {
      await invalidateLotteryCache(country, lottery, state);
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
