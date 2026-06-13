import { log } from '#core/common/lib/log.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { getRequestBody } from '#core/server/lib/request.js';

/** @type {(pathname: string) => { id: number; routeKey: string }} */
function resolveRouteKey(pathname) {
	const isApi = pathname.startsWith('/api/');
	const [, rawRouteName = '', rawId, rawIdInApi] = pathname.split('/');
	const id = Number(isApi ? rawIdInApi : rawId);
	let routeName = rawRouteName;

	if (isApi) {
		routeName = `api/${rawId}`;
	}

	const routeKey = Number.isNaN(id) ? pathname : `/${routeName}/:id`;

	return { id, routeKey };
}

/** @type {(options: CreateStandardRouteDispatcherOptions) => ServerMiddleware} */
function createStandardRouteDispatcher({ isQuiet = false, renderErrorPage, renderPage }) {
	/** @type {(error: unknown, url: URL) => Promise<{ statusCode: number; template: string }>} */
	async function handleError(error, { href, pathname }) {
		let message = 'На сервере произошла ошибка.';
		let statusCode = 500;

		if (error instanceof Error) {
			if (typeof error.cause === 'number') {
				statusCode = error.cause;
			}
			if (getSiteConfig().isDev || statusCode !== 500) {
				({ message } = error);
			}
		}

		if (!isQuiet && !pathname?.startsWith('/__') && statusCode >= 500) {
			log.error(`❌ [HTTP ERROR ${statusCode} | ${href}]`, error);
		}

		const heading = `Ошибка ${statusCode}`;
		const template = await renderPage({
			description: 'Страница ошибок.',
			heading,
			pageTemplate: renderErrorPage(statusCode, message),
			pathname,
		});

		return { statusCode, template };
	}

	/** @type {ServerMiddleware} */
	async function dispatch(req, res) {
		const { host, routes } = getSiteConfig();

		if (!routes) {
			throw new Error('Routes not configured');
		}

		const { method = 'GET' } = req;
		const url = new URL(req.url ?? '/', host || 'http://localhost');
		const { pathname } = url;
		const { id, routeKey } = resolveRouteKey(pathname);
		const route = routes[routeKey];

		let contentType = 'text/html; charset=utf-8';
		let template = '';
		let statusCode = 200;

		try {
			if (!route) {
				throw new Error('Страница не найдена.', { cause: 404 });
			}

			if (!route[method]) {
				if (method === 'HEAD' && route.GET) {
					route.HEAD = route.GET;
				} else {
					throw new Error('Method not allowed!', { cause: 405 });
				}
			}

			const body = await getRequestBody(req);
			const routeData = await route[method]({ body, id, isAuthorized: false, req, res });
			({ contentType = 'text/html; charset=utf-8', statusCode = 200, template = '' } = routeData);

			if (routeData.page) {
				template = await renderPage({ ...routeData.page, pathname });
			}
		} catch (error) {
			({ statusCode, template } = await handleError(error, url));
		}

		res.setHeader('Content-Type', contentType);
		res.statusCode = statusCode;
		res.end(method === 'HEAD' ? '' : template);
	}

	return dispatch;
}

export { createStandardRouteDispatcher, resolveRouteKey };
