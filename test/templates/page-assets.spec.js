import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { buildAssetQuery } from '#core/common/lib/asset-version.js';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { renderPageAssets } from '#core/common/templates/page-assets.js';

describe('Общее/Ассеты страницы', () => {
	beforeEach(() => {
		setSiteConfig({
			version: { CSS: 5, JS: 1 },
			yandexMetrikaId: 102299682,
		});
	});

	afterEach(() => {
		delete process.env.DEV;
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('renderPageAssets в dev отдаёт importmap и reload без метрики', () => {
		process.env.DEV = '1';
		setSiteConfig({});

		const markup = renderPageAssets({ pathname: '/' });

		assert.match(markup, /href="\/client\/css\/main\.css"/);
		assert.match(markup, /type="importmap"/);
		assert.match(markup, /window\.DEV=1/);
		assert.match(markup, /EventSource\('\/dev\/watch'\)/);
		assert.doesNotMatch(markup, /metrika/);
	});

	test('renderPageAssets в prod отдаёт versioned css и метрику', () => {
		const markup = renderPageAssets({ pathname: '/' });

		assert.match(markup, new RegExp(`/bundles/main\\.css${buildAssetQuery(5).replace('?', '\\?')}`));
		assert.match(markup, /\/bundles\/main\.js/);
		assert.doesNotMatch(markup, /window\.DEV/);
	});

	test('renderPageAssets на служебных маршрутах в prod без метрики', () => {
		const markup = renderPageAssets({ pathname: '/__/404' });

		assert.match(markup, /\/bundles\/main\.css/);
		assert.doesNotMatch(markup, /metrika/);
	});
});
