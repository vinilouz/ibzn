type CacheEntry<T> = {
	data: T;
	timestamp: number;
	ttl: number;
	hits: number;
};

class QueryCache {
	private cache = new Map<string, CacheEntry<any>>();
	private defaultTTL = 90000; // 90 segundos
	private maxSize = 200; // Aumentado para mais cache

	async get<T>(
		key: string,
		fetcher: () => Promise<T>,
		ttl: number = this.defaultTTL
	): Promise<T> {
		const cached = this.cache.get(key);
		const now = Date.now();

		if (cached) {
			const age = now - cached.timestamp;

			if (age < cached.ttl) {
				cached.hits++;
				return cached.data;
			}

			if (age < cached.ttl * 1.5) {
				cached.hits++;
				this.revalidateInBackground(key, fetcher, ttl);
				return cached.data;
			}
		}

		const data = await fetcher();

		if (this.cache.size >= this.maxSize) {
			this.evictLRU();
		}

		this.cache.set(key, { data, timestamp: now, ttl, hits: 0 });

		return data;
	}

	private async revalidateInBackground<T>(
		key: string,
		fetcher: () => Promise<T>,
		ttl: number
	): Promise<void> {
		try {
			const data = await fetcher();
			this.cache.set(key, {
				data,
				timestamp: Date.now(),
				ttl,
				hits: this.cache.get(key)?.hits || 0
			});
		} catch (error) {
			console.error('Background revalidation failed:', error);
		}
	}

	private evictLRU() {
		let oldestKey: string | null = null;
		let oldestTime = Infinity;
		let minHits = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			if (entry.hits < minHits || (entry.hits === minHits && entry.timestamp < oldestTime)) {
				oldestKey = key;
				oldestTime = entry.timestamp;
				minHits = entry.hits;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
		}
	}

	invalidate(key: string) {
		this.cache.delete(key);
	}

	invalidatePattern(pattern: string) {
		const keys = Array.from(this.cache.keys());
		keys.forEach((key) => {
			if (key.includes(pattern)) {
				this.cache.delete(key);
			}
		});
	}

	clear() {
		this.cache.clear();
	}

	getStats() {
		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
				key,
				age: Date.now() - entry.timestamp,
				ttl: entry.ttl,
				hits: entry.hits
			}))
		};
	}
}

export const cache = new QueryCache();
