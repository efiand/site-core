import { createServer } from 'node:http';
import { log } from '#core/common/lib/log.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { createStandardRouteDispatcher } from '#core/server/lib/route-dispatcher.js';

/** @type {(server?: import('node:http').Server) => Promise<void>} */
async function closeApp(server) {
	try {
		if (server) {
			await new Promise((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve('')));
			});
		}
	} catch (error) {
		log.error('❌ [CLOSING ERROR]', error);
	}
}

/** @type {(options: CreateHttpServerOptions) => import('node:http').Server} */
function createHttpServer({ dispatch, isQuiet = false, middleware, port, renderErrorPage, renderPage }) {
	const { port: configPort } = getSiteConfig();
	const onRequest =
		dispatch ??
		createStandardRouteDispatcher({
			isQuiet,
			renderErrorPage,
			renderPage,
		});

	const server = createServer((req, res) => {
		if (middleware) {
			middleware(req, res, onRequest);
		} else {
			onRequest(req, res);
		}
	});

	server.listen(port ?? configPort, 'localhost', () => {
		const address = server.address();
		if (address && typeof address !== 'string') {
			const config = getSiteConfig();
			config.port = address.port;
			config.host = `http://localhost:${address.port}`;
		}

		if (!isQuiet) {
			log.info(`✅ Сервер запущен по адресу: ${getSiteConfig().host}`);
		}
	});

	return server;
}

/** @type {(server?: import('node:http').Server) => string} */
function getAppHost(server) {
	if (!server) {
		throw new Error('Сервер не запущен');
	}

	const address = server.address();

	if (!address || typeof address === 'string') {
		throw new Error('Сервер не слушает порт');
	}

	return `http://localhost:${address.port}`;
}

/** @type {(server: import('node:http').Server) => Promise<void>} */
async function waitForApp(server) {
	if (server.listening) {
		return;
	}

	await new Promise((resolve, reject) => {
		server.once('listening', resolve);
		server.once('error', reject);
	});
}

export { closeApp, createHttpServer, getAppHost, waitForApp };
