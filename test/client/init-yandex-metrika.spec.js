// @ts-nocheck
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { Window } from 'happy-dom';
import { initYandexMetrika, trackPageView } from '#core/client/lib/init-yandex-metrika.js';
import { getSiteConfig, setSiteConfig } from '#core/common/lib/site-config.js';

describe('Клиент/init-yandex-metrika', () => {
	beforeEach(() => {
		const window = new Window({
			settings: {
				disableJavaScriptFileLoading: true,
				handleDisabledFileLoadingAsSuccess: true,
			},
		});
		globalThis.window = window;
		globalThis.document = window.document;
		setSiteConfig({ yandexMetrikaId: 99938263 });
	});

	afterEach(() => {
		delete process.env.DEV;
		delete globalThis.window;
		delete globalThis.document;
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('initYandexMetrika без id счётчика не загружает tag.js', () => {
		process.env.DEV = '1';
		setSiteConfig({ yandexMetrikaId: 99938263 });

		initYandexMetrika({ delayMs: 0 });

		assert.equal(getSiteConfig().yandexMetrikaId, 0);
		assert.equal(globalThis.document.querySelectorAll('script[src*="mc.yandex.ru"]').length, 0);
		assert.equal(globalThis.window.ym, undefined);
	});

	test('trackPageView без id счётчика не ставит hit в очередь', () => {
		process.env.DEV = '1';
		setSiteConfig({ yandexMetrikaId: 99938263 });

		trackPageView('https://example.com/', 'Example');

		assert.equal(globalThis.window.__metrikaHitsQueue, undefined);
	});
});
