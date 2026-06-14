import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { renderTimeTag } from '#core/common/templates/time.js';

describe('Общее/time', () => {
	test('renderTimeTag без date и text возвращает пустую строку', () => {
		assert.equal(renderTimeTag(), '');
		assert.equal(renderTimeTag({ date: null, text: '' }), '');
		assert.equal(renderTimeTag({ date: '   ', text: '   ' }), '');
	});

	test('renderTimeTag рендерит datetime и текст из date', () => {
		const markup = renderTimeTag({ date: '2026-06-09' });

		assert.equal(markup, '<time datetime="2026-06-09">09.06.2026</time>');
	});

	test('renderTimeTag берёт полный datetime из ISO и форматирует display по дате', () => {
		const markup = renderTimeTag({ date: '2026-06-09T12:00:00.000Z' });

		assert.equal(markup, '<time datetime="2026-06-09T12:00:00.000Z">09.06.2026</time>');
	});

	test('renderTimeTag нормализует datetime из формата БД', () => {
		const markup = renderTimeTag({ date: '2026-06-09 14:30:00' });

		assert.equal(markup, '<time datetime="2026-06-09T14:30:00">09.06.2026</time>');
	});

	test('renderTimeTag использует переданный text', () => {
		const markup = renderTimeTag({ date: '2026-06-12', text: '12 июня 2026' });

		assert.equal(markup, '<time datetime="2026-06-12">12 июня 2026</time>');
	});

	test('renderTimeTag рендерит text без date', () => {
		const markup = renderTimeTag({ text: 'без даты' });

		assert.equal(markup, '<time>без даты</time>');
	});

	test('renderTimeTag добавляет className', () => {
		const markup = renderTimeTag({ className: '_separated', date: '2026-06-09' });

		assert.equal(markup, '<time class="_separated" datetime="2026-06-09">09.06.2026</time>');
	});
});
