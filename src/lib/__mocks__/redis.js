const store = new Map();

export function __clearCache() {
  store.clear();
}

export async function getCache(key) {
  const item = store.get(key);
  if (!item) return null;
  if (item.expiresAt && Date.now() > item.expiresAt) {
    store.delete(key);
    return null;
  }
  return item.value;
}

export async function setCache(key, value, ttlSeconds = 300) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function delCache(key) {
  store.delete(key);
}
