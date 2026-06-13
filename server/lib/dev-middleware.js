import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { log } from '#core/common/lib/log.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { STATIC_MIME_TYPES, staticExtensions } from '#core/common/lib/static-mime-types.js';

/** @type {(pathname: string, isDev?: boolean) => string} */
function getStaticRoot(pathname, isDev = getSiteConfig().isDev) {
	if (!isDev) {
		return './public';
	}

	if (/^\/client\/.*\.(css|js|svg)$/.test(pathname)) {
		return './src';
	}

	if (/^\/common|components\/.*\.js$/.test(pathname)) {
		return './app';
	}

	if (/^\/core\/.*\.(css|js|svg)$/.test(pathname)) {
		return './node_modules/site-core';
	}

	return './public';
}

/** @type {(pathname: string, cwd?: string, isDev?: boolean) => string} */
function resolveStaticPath(pathname, cwd = process.cwd(), isDev = getSiteConfig().isDev) {
	const root = getStaticRoot(pathname, isDev);
	if (root === './node_modules/site-core') {
		return path.join(cwd, root, pathname.replace(/^\/core\//, ''));
	}
	return path.join(cwd, root, pathname);
}

let sseData = 'reload';

/** @type {(res: RouteResponse) => void} */
function sendReload(res) {
	res.writeHead(200, {
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
		'Content-Type': 'text/event-stream',
	});
	res.write(`retry: 33\ndata: ${sseData}\nid: ${Date.now()}\n\n`);
	sseData = '';
}

/** @type {(options?: CreateDevMiddlewareOptions) => ServerMiddleware} */
function createDevMiddleware({ onStaticRequest } = {}) {
	/** @type {ServerMiddleware} */
	return async (req, res, next) => {
		const { host, isDev } = getSiteConfig();

		if (isDev && req.url === '/dev/watch') {
			sendReload(res);
			return;
		}

		const { pathname } = new URL(req.url ?? '/', host || 'http://localhost');
		if (pathname.includes('.well-known/appspecific/com.chrome.devtools.json')) {
			res.setHeader('Content-Type', 'application/json');
			res.end('{}');
			return;
		}

		const ext = path.extname(pathname);
		if (!staticExtensions.has(ext)) {
			next?.(req, res);
			return;
		}

		if (onStaticRequest) {
			const handled = await onStaticRequest({ ext, next, pathname, req, res });
			if (handled) {
				return;
			}
		}

		try {
			const filePath = resolveStaticPath(pathname);
			await access(filePath);
			res.writeHead(200, { 'Content-Type': STATIC_MIME_TYPES[ext] });
			createReadStream(filePath).pipe(res);
		} catch (error) {
			log.error(error);
			next?.(req, res);
		}
	};
}

export { createDevMiddleware, getStaticRoot, resolveStaticPath, sendReload };
