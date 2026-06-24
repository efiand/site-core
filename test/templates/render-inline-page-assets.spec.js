import assert from 'node:assert/strict';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { createRenderInlinePageAssets } from '#core/common/templates/render-inline-page-assets.js';

const fixtureRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/inline-host');

describe('Общее/Inline-ассеты страницы', () => {
	beforeEach(() => {
		setSiteConfig({
			yandexMetrikaId: 99938263,
		});
	});

	afterEach(() => {
		delete process.env.DEV;
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('createRenderInlinePageAssets в dev делегирует в renderPageAssets', async () => {
		process.env.DEV = '1';
		setSiteConfig({});

		const renderInlinePageAssets = createRenderInlinePageAssets({ cwd: fixtureRoot });
		const markup = await renderInlinePageAssets({ pathname: '/' });

		assert.match(markup, /href="\/client\/css\/main\.css"/);
		assert.match(markup, /type="importmap"/);
		assert.doesNotMatch(markup, /<style>/);
	});

	test('createRenderInlinePageAssets в prod отдаёт inline style и script', async () => {
		const renderInlinePageAssets = createRenderInlinePageAssets({ cwd: fixtureRoot });
		const markup = await renderInlinePageAssets({ pathname: '/' });

		assert.match(markup, /<style>/);
		assert.match(markup, /color:\s*red/);
		assert.match(markup, /<script type="module">/);
		assert.match(markup, /fixtureValue/);
		assert.doesNotMatch(markup, /ym\(/);
	});

	test('createRenderInlinePageAssets на служебных маршрутах отдаёт inline style и script', async () => {
		const renderInlinePageAssets = createRenderInlinePageAssets({ cwd: fixtureRoot });
		const markup = await renderInlinePageAssets({ pathname: '/__/404' });

		assert.match(markup, /<style>/);
		assert.match(markup, /<script type="module">/);
		assert.doesNotMatch(markup, /ym\(/);
	});
});
