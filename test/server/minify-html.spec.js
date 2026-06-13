import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { minifyHtml } from '#core/server/lib/minify-html.js';

describe('Сервер/minify-html', () => {
	test('Схлопывает пробелы и убирает комментарии', async () => {
		const html = /* html */ `
		<!-- comment -->
		<div class="foo">
			Hello   world
		</div>
	`;

		const result = await minifyHtml(html);

		assert.doesNotMatch(result, /<!--/);
		assert.match(result, /<div class=foo>/);
		assert.match(result, />Hello world</);
	});

	test('Минифицирует inline-скрипт', async () => {
		const html = /* html */ '<script>const  x  =  1 ;</script>';

		const result = await minifyHtml(html);

		assert.match(result, /<script>/);
		assert.doesNotMatch(result, /const {2}x/);
	});

	test('Оборачивает плейсхолдеры template literal в кавычки', async () => {
		const dollarSign = '$';
		const html = /* html */ `<a href=${dollarSign}{link} class=${dollarSign}{className}>text</a>`;

		const result = await minifyHtml(html);

		assert.match(result, /href="\$\{link\}"/);
		assert.match(result, /class="\$\{className\}"/);
	});
});
