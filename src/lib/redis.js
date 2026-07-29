// src/lib/redis.js
// Cliente de Caché de Alta Velocidad (Upstash Redis con Fallback en Memoria para Dev Local)

import { Redis } from '@upstash/redis';

// Caché fallback en memoria para desarrollo si no hay credenciales de Redis configuradas
const inMemoryCache = new Map();

let redisClient = null;

// Verifica si existen las variables de entorno de Upstash Redis
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Obtener valor de la caché (Redis o Memoria)
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function getCache(key) {
  try {
    if (redisClient) {
      return await redisClient.get(key);
    }
    
    // Fallback memoria local
    const item = inMemoryCache.get(key);
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      inMemoryCache.delete(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error(`[Redis Get Error] Error al leer llave "${key}":`, error);
    return null;
  }
}

/**
 * Guardar valor en la caché con Tiempo de Vida (TTL en segundos)
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds - Tiempo de expiración en segundos (por defecto 300s / 5min)
 */
export async function setCache(key, value, ttlSeconds = 300) {
  try {
    if (redisClient) {
      await redisClient.set(key, value, { ex: ttlSeconds });
      return;
    }

    // Fallback memoria local
    inMemoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  } catch (error) {
    console.error(`[Redis Set Error] Error al guardar llave "${key}":`, error);
  }
}

/**
 * Eliminar llave de la caché (para invalidaciones en tiempo real cuando hay un nuevo sorteo)
 * @param {string} key
 */
export async function delCache(key) {
  try {
    if (redisClient) {
      await redisClient.del(key);
      return;
    }
    inMemoryCache.delete(key);
  } catch (error) {
    console.error(`[Redis Del Error] Error al eliminar llave "${key}":`, error);
  }
}
