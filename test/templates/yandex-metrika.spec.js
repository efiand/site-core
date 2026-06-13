import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { renderYandexMetrika } from '#core/common/templates/yandex-metrika.js';

describe('Общее/yandex-metrika', () => {
	beforeEach(() => {
		setSiteConfig({ yandexMetrikaId: 102299682 });
	});

	afterEach(() => {
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('renderYandexMetrika вставляет id счётчика только в noscript', () => {
		const markup = renderYandexMetrika({ pathname: '/' });

		assert.match(markup, /watch\/102299682/);
		assert.match(markup, /<noscript>/);
		assert.doesNotMatch(markup, /<script/);
		assert.doesNotMatch(markup, /setTimeout/);
	});

	test('renderYandexMetrika без id счётчика — пустая строка', () => {
		setSiteConfig({ yandexMetrikaId: 0 });
		assert.equal(renderYandexMetrika({ pathname: '/' }), '');
		assert.equal(renderYandexMetrika(), '');
	});

	test('renderYandexMetrika пропускает служебные маршруты под /__', () => {
		assert.equal(renderYandexMetrika({ pathname: '/__/404' }), '');
	});
});
