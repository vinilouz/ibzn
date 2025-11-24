// Only enable debug logs in development
const DEBUG = import.meta.env.DEV;

export const logger = {
	log: (...args: any[]) => {
		if (DEBUG) console.log('[LOG]', ...args);
	},
	error: (...args: any[]) => {
		// Always log errors, even in production
		console.error('[ERROR]', ...args);
	},
	warn: (...args: any[]) => {
		if (DEBUG) console.warn('[WARN]', ...args);
	},
	info: (...args: any[]) => {
		if (DEBUG) console.info('[INFO]', ...args);
	},
};
