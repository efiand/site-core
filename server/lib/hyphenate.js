import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** @type {import('hyphen/ru/index.js').Hyphenator | null} */
let runRu = null;

/** @type {(text?: string) => Promise<string>} */
async function hyphenateRu(text = '') {
	if (!runRu) {
		runRu = await loadHyphenRu();
	}

	return await runRu(text);
}

/** @returns {Promise<import('hyphen/ru/index.js').Hyphenator>} */
async function loadHyphenRu() {
	try {
		return (await import('hyphen/ru/index.js')).default.hyphenate;
	} catch {
		const nested = path.join(process.cwd(), 'node_modules/site-core/node_modules/hyphen/ru/index.js');

		return (await import(pathToFileURL(nested).href)).default.hyphenate;
	}
}

export { hyphenateRu };
