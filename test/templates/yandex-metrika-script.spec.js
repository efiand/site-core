import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { buildAssetQuery } from '#core/common/lib/asset-version.js';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { shouldIncludeYandexMetrika } from '#core/common/lib/yandex-metrika-guard.js';
import { buildYandexMetrikaScriptUrl } from '#core/common/lib/yandex-metrika-script-url.js';
import { renderYandexMetrikaScript } from '#core/common/templates/yandex-metrika-script.js';

describe('Общее/yandex-metrika-guard', () => {
	beforeEach(() => {
		setSiteConfig({ yandexMetrikaId: 102299682 });
	});

	afterEach(() => {
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('shouldIncludeYandexMetrika false без id счётчика', () => {
		setSiteConfig({ yandexMetrikaId: 0 });
		assert.equal(shouldIncludeYandexMetrika({ pathname: '/' }), false);
	});

	test('shouldIncludeYandexMetrika false на служебных маршрутах', () => {
		assert.equal(shouldIncludeYandexMetrika({ pathname: '/__/404' }), false);
	});

	test('shouldIncludeYandexMetrika true для публичных страниц', () => {
		assert.equal(shouldIncludeYandexMetrika({ pathname: '/' }), true);
	});
});

describe('Общее/yandex-metrika-script-url', () => {
	beforeEach(() => {
		setSiteConfig({ version: { CSS: 0, JS: 3 } });
	});

	test('buildYandexMetrikaScriptUrl в dev отдаёт entry', () => {
		assert.equal(buildYandexMetrikaScriptUrl({ isDev: true }), '/client/entries/main.js');
	});

	test('buildYandexMetrikaScriptUrl в prod отдаёт versioned bundle', () => {
		const url = buildYandexMetrikaScriptUrl({ isDev: false });

		assert.equal(url, `/bundles/main.js${buildAssetQuery(3)}`);
	});
});

describe('Общее/yandex-metrika-script', () => {
	beforeEach(() => {
		setSiteConfig({
			version: { CSS: 0, JS: 2 },
			yandexMetrikaId: 102299682,
		});
	});

	afterEach(() => {
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('renderYandexMetrikaScript вставляет module script', () => {
		const markup = renderYandexMetrikaScript({ isDev: false, pathname: '/' });

		assert.match(markup, /<script type="module" src="\/bundles\/main\.js/);
		assert.match(markup, /defer/);
	});

	test('renderYandexMetrikaScript на служебных маршрутах — пустая строка', () => {
		assert.equal(renderYandexMetrikaScript({ isDev: false, pathname: '/__/update' }), '');
	});
});
