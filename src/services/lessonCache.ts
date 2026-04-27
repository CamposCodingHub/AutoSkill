const lessonCache = new Map<string, any>();

export const lessonCacheService = {
  get: (key: string) => lessonCache.get(key),
  
  set: (key: string, data: any) => {
    lessonCache.set(key, data);
  },
  
  getOrFetch: async (key: string, fetchFn: () => Promise<any>) => {
    const cached = lessonCache.get(key);
    if (cached) {
      return cached;
    }
    
    const data = await fetchFn();
    lessonCache.set(key, data);
    return data;
  },
  
  clear: () => lessonCache.clear(),
  
  has: (key: string) => lessonCache.has(key),
  
  delete: (key: string) => lessonCache.delete(key),
  
  size: () => lessonCache.size,
};

export default lessonCacheService;
