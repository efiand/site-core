import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { buildAssetQuery } from '#core/common/lib/asset-version.js';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { renderClientEntryScript } from '#core/common/templates/client-entry-script.js';

describe('Общее/client-entry-script', () => {
	beforeEach(() => {
		setSiteConfig({
			version: { CSS: 0, JS: 2 },
			yandexMetrikaId: 0,
		});
	});

	afterEach(() => {
		delete process.env.DEV;
	});

	test('renderClientEntryScript в prod вставляет versioned bundle', () => {
		const markup = renderClientEntryScript({ pathname: '/' });

		assert.match(markup, new RegExp(`/bundles/main\\.js${buildAssetQuery(2).replace('?', '\\?')}`));
		assert.match(markup, /defer/);
	});

	test('renderClientEntryScript в dev вставляет entry', () => {
		process.env.DEV = '1';
		setSiteConfig({});

		const markup = renderClientEntryScript({ pathname: '/' });

		assert.match(markup, /src="\/client\/entries\/main\.js"/);
	});

	test('renderClientEntryScript на служебных маршрутах — пустая строка', () => {
		assert.equal(renderClientEntryScript({ pathname: '/__/update' }), '');
	});
});
