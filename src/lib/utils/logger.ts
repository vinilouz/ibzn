const DEBUG = true;

export const logger = {
	log: (...args: any[]) => {
		if (DEBUG) console.log('[LOG]', ...args);
	},
	error: (...args: any[]) => {
		if (DEBUG) console.error('[ERROR]', ...args);
	},
	warn: (...args: any[]) => {
		if (DEBUG) console.warn('[WARN]', ...args);
	},
	info: (...args: any[]) => {
		if (DEBUG) console.info('[INFO]', ...args);
	},
};
