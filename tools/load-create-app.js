import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** @type {() => Promise<(options?: CreateAppOptions) => import('node:http').Server>} */
async function loadCreateApp() {
	const appRel = process.env.SITE_CORE_APP ?? 'app/server/lib/app.js';
	const appUrl = pathToFileURL(path.resolve(process.cwd(), appRel)).href;
	const mod = await import(appUrl);

	if (typeof mod.createApp !== 'function') {
		throw new Error(`"${appRel}" must export createApp()`);
	}

	return mod.createApp;
}

export { loadCreateApp };
