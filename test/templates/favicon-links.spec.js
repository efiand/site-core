import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { renderFaviconLinks } from '#core/common/templates/favicon-links.js';

describe('Общее/favicon-links', () => {
	test('renderFaviconLinks рендерит стандартные пути из корня', () => {
		const markup = renderFaviconLinks();

		assert.match(markup, /href="\/favicon-96x96\.png"/);
		assert.match(markup, /href="\/favicon\.svg"/);
		assert.match(markup, /href="\/apple-touch-icon\.png"/);
		assert.match(markup, /href="\/site\.webmanifest"/);
		assert.doesNotMatch(markup, /favicon\.ico/);
	});

	test('renderFaviconLinks поддерживает faviconPrefix для зеркала manuscript', () => {
		const markup = renderFaviconLinks({ faviconPrefix: '/manuscript' });

		assert.match(markup, /href="\/manuscript\/favicon\.svg"/);
		assert.match(markup, /href="\/manuscript\/site\.webmanifest"/);
	});
});
