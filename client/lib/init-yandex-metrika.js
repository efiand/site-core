/// <reference path="../../types/index.d.ts" />

import { loadScript } from '#core/client/lib/load-script.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';

const YANDEX_METRIKA_TAG_URL = 'https://mc.yandex.ru/metrika/tag.js';

/** @type {(options?: YandexMetrikaInitOptions) => void} */
function initYandexMetrika({
	accurateTrackBounce = true,
	clickmap = true,
	counterId = getSiteConfig().yandexMetrikaId,
	delayMs = 3000,
	trackLinks = true,
	webvisor = true,
} = {}) {
	if (!counterId) {
		return;
	}

	setTimeout(() => {
		/** @type {NonNullable<Window['ym']>} */
		const ymStub = function (...args) {
			const queue = ymStub.a || [];
			queue.push(args);
			ymStub.a = queue;
		};
		window.ym = window.ym || ymStub;
		window.ym.l = Date.now();

		void loadScript(YANDEX_METRIKA_TAG_URL, { async: true, defer: false });

		window.ym(counterId, 'init', {
			accurateTrackBounce,
			clickmap,
			trackLinks,
			webvisor,
		});

		window.__metrikaHitsQueue?.forEach(({ url, title }) => {
			window.ym?.(counterId, 'hit', url, { title });
		});
		window.__metrikaHitsQueue = [];
	}, delayMs);
}

/** @type {(url: string, title: string, counterId?: number) => void} */
function trackPageView(url, title, counterId = getSiteConfig().yandexMetrikaId) {
	if (!counterId) {
		return;
	}

	if (typeof window.ym !== 'function') {
		window.__metrikaHitsQueue = window.__metrikaHitsQueue || [];
		window.__metrikaHitsQueue.push({ title, url });
		return;
	}

	window.ym(counterId, 'hit', url, {
		referer: document.referrer,
		title,
	});
}

export { initYandexMetrika, trackPageView };
