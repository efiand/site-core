// @ts-nocheck
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { Window } from 'happy-dom';
import { loadScript } from '#core/client/lib/load-script.js';

describe('Клиент/load-script', () => {
	beforeEach(() => {
		const window = new Window({
			settings: {
				disableJavaScriptFileLoading: true,
				handleDisabledFileLoadingAsSuccess: true,
			},
		});
		globalThis.window = window;
		globalThis.document = window.document;
	});

	afterEach(() => {
		delete globalThis.window;
		delete globalThis.document;
	});

	test('Добавляет script в head и резолвится по load', async () => {
		const src = 'https://example.com/script.js';
		const element = await loadScript(src, { async: true, defer: false });

		assert.equal(element.parentElement?.tagName, 'HEAD');
		assert.equal(element.async, true);
		assert.equal(element.defer, false);
		assert.equal(element.getAttribute('src'), src);
	});

	test('Для дублирующего src возвращает тот же promise', async () => {
		const src = 'https://example.com/dedupe.js';
		const first = loadScript(src);
		const second = loadScript(src);

		assert.strictEqual(first, second);
		assert.equal(globalThis.document.querySelectorAll(`script[src="${src}"]`).length, 1);
		await first;
	});

	test('Отклоняет promise при ошибке загрузки скрипта', async () => {
		const window = new Window({
			settings: {
				disableJavaScriptFileLoading: true,
				handleDisabledFileLoadingAsSuccess: false,
			},
		});
		globalThis.window = window;
		globalThis.document = window.document;

		const src = 'https://example.com/missing.js';
		const promise = loadScript(src);

		await assert.rejects(promise, /Не удалось загрузить скрипт/);
	});
});
