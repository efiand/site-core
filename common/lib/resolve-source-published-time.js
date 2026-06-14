/// <reference path="../../types/index.d.ts" />

import { stat } from 'node:fs/promises';
import { getSiteConfig } from '#core/common/lib/site-config.js';

/** @type {(options: { fallback: string; sourcePath: string }) => Promise<string>} */
async function resolveSourcePublishedTime({ fallback, sourcePath }) {
	if (typeof process === 'undefined' || getSiteConfig().isDev) {
		return fallback;
	}

	try {
		const { mtime } = await stat(sourcePath);

		return mtime.toISOString();
	} catch {
		return fallback;
	}
}

export { resolveSourcePublishedTime };
