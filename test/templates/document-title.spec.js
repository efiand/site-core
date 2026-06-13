import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { getSiteConfig, setSiteConfig } from '#core/common/lib/site-config.js';
import { renderDocumentTitle } from '#core/common/templates/document-title.js';

describe('Общее/site-config', () => {
	beforeEach(() => {
		setSiteConfig({ projectTitle: 'efiand' });
	});

	afterEach(() => {
		setSiteConfig({ projectTitle: '' });
	});

	test('getSiteConfig возвращает текущее состояние', () => {
		assert.strictEqual(getSiteConfig().projectTitle, 'efiand');
	});

	test('setSiteConfig подмешивает частичное состояние', () => {
		setSiteConfig({ projectTitle: 'host' });
		assert.strictEqual(getSiteConfig().projectTitle, 'host');
	});
});

describe('Общее/document-title', () => {
	beforeEach(() => {
		setSiteConfig({ projectTitle: 'efiand' });
	});

	afterEach(() => {
		setSiteConfig({ projectTitle: '' });
	});

	test('Склеивает части и projectTitle через |', () => {
		assert.strictEqual(renderDocumentTitle(['Заказать сайт']), 'Заказать сайт | efiand');
	});

	test('Без частей возвращает только projectTitle', () => {
		assert.strictEqual(renderDocumentTitle(), 'efiand');
		assert.strictEqual(renderDocumentTitle([]), 'efiand');
	});

	test('Склеивает несколько частей перед projectTitle', () => {
		assert.strictEqual(
			renderDocumentTitle(['Прекрасная пора', 'Стихотворения']),
			'Прекрасная пора | Стихотворения | efiand',
		);
	});
});
