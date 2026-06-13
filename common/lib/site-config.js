/// <reference path="../../types/index.d.ts" />

const SERVICE_PAGES = new Set(['/__/404', '/__/update', '/404.html']);

/** @type {SiteConfigState} */
const state = {
	baseHost: '',
	baseUrl: '',
	buildPages: new Set(),
	email: '',
	hasDb: false,
	host: '',
	isDev: false,
	port: 0,
	projectDescription: '',
	projectTitle: '',
	publicPages: new Set(),
	routes: null,
	staticPages: new Set(),
	version: {
		CSS: 0,
		JS: 0,
	},
	yandexMetrikaId: 0,
};

/** @type {Set<string>} */
let routePaths = new Set();

/**
 * Текущий конфиг сайта. Только чтение — без побочных эффектов.
 *
 * @type {() => SiteConfigState}
 */
function getSiteConfig() {
	return state;
}

/**
 * Обновляет конфиг сайта. Только запись — без возвращаемого значения.
 *
 * @type {(patch: SiteConfigPatch) => void}
 */
function setSiteConfig(patch) {
	const { baseHost, publicPages, routes, ...rest } = patch;
	Object.assign(state, rest);

	if (baseHost !== undefined) {
		state.baseHost = baseHost;
		state.baseUrl = baseHost ? `https://${baseHost}` : '';
	}

	if (routes !== undefined) {
		routePaths = new Set(Object.keys(routes));
		state.publicPages = new Set(
			Object.keys(routes).filter(
				(path) => !path.startsWith('/__/') && path !== '/sitemap.xml' && !path.includes('.') && !path.includes(':'),
			),
		);

		if (typeof process !== 'undefined') {
			state.routes = routes;
		}
	}

	if (publicPages !== undefined) {
		for (const page of publicPages) {
			state.publicPages.add(page);
		}
	}

	if (routes !== undefined || publicPages !== undefined) {
		state.staticPages = new Set(state.publicPages);

		for (const page of SERVICE_PAGES) {
			if (routePaths.has(page)) {
				state.staticPages.add(page);
			}
		}

		state.buildPages = new Set(state.staticPages);
		state.buildPages.add('/sitemap.xml');
	}

	if (typeof process !== 'undefined') {
		state.isDev = Boolean(process.env.DEV);

		const devPort = Number(process.env.DEV_PORT);
		const port = Number(process.env.PORT);
		const isPreview = Boolean(process.env.PREVIEW);
		state.port = state.isDev && devPort && !isPreview ? devPort : port || 0;
		state.host = state.port ? `http://localhost:${state.port}` : '';
	} else {
		state.isDev = Boolean(window.DEV);
	}
}

export { getSiteConfig, setSiteConfig };
