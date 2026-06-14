import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { hyphenateRu } from '#core/server/lib/hyphenate.js';

describe('Сервер/hyphenate', () => {
	test('Вставляет мягкие переносы в русские слова', async () => {
		const result = await hyphenateRu('перенос');

		assert.match(result, /\u00AD/);
	});

	test('Не меняет HTML-теги', async () => {
		const html = '<p class="content">перенос</p>';
		const result = await hyphenateRu(html);

		assert.match(result, /^<p class="content">/);
		assert.match(result, /<\/p>$/);
	});

	test('Возвращает пустую строку для пустого ввода', async () => {
		assert.strictEqual(await hyphenateRu(''), '');
	});
});
