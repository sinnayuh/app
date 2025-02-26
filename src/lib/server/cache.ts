interface CacheData {
    data: any;
    lastUpdated: number;
}

class CacheService {
    private cache: Map<string, CacheData> = new Map();
    private updateIntervals: Map<string, NodeJS.Timer> = new Map();
    private readonly DEFAULT_TTL = 60 * 1000;

    async get(key: string, fetchData: () => Promise<any>, ttl = this.DEFAULT_TTL): Promise<any> {
        const now = Date.now();
        const cached = this.cache.get(key);

        if (cached && (now - cached.lastUpdated < ttl)) {
            return cached.data;
        }

        const data = await fetchData();
        this.cache.set(key, { data, lastUpdated: now });
        return data;
    }

    startInterval(key: string, fetchData: () => Promise<any>, interval: number) {
        if (this.updateIntervals.has(key)) {
            clearInterval(this.updateIntervals.get(key) as NodeJS.Timeout);
        }

        const timer = setInterval(async () => {
            try {
                const data = await fetchData();
                this.cache.set(key, { data, lastUpdated: Date.now() });
            } catch (error) {
                console.error(`Error updating cache for ${key}:`, error);
            }
        }, interval);

        this.updateIntervals.set(key, timer);
    }

    stopInterval(key: string) {
        const interval = this.updateIntervals.get(key);
        if (interval) {
            clearInterval(interval as NodeJS.Timeout);
            this.updateIntervals.delete(key);
        }
    }
}

export const cache = new CacheService();
