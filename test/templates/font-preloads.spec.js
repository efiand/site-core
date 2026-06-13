import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { renderFontPreloads } from '#core/common/templates/font-preloads.js';

describe('Общее/font-preloads', () => {
	test('renderFontPreloads рендерит woff2 preload под /fonts/', () => {
		const markup = renderFontPreloads(['manrope-400.woff2', 'manrope-500.woff2']);

		assert.match(markup, /href="\/fonts\/manrope-400\.woff2"/);
		assert.match(markup, /href="\/fonts\/manrope-500\.woff2"/);
		assert.match(markup, /type="font\/woff2"/);
		assert.match(markup, /crossorigin="anonymous"/);
	});

	test('renderFontPreloads без шрифтов — пустая строка', () => {
		assert.equal(renderFontPreloads(), '');
		assert.equal(renderFontPreloads([]), '');
	});
});
