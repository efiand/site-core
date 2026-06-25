import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { initSiteClient } from '#core/client/lib/init-site-client.js';

describe('Клиент/init-site-client', () => {
	test('initSiteClient без window — no-op', () => {
		const previousWindow = globalThis.window;

		// @ts-expect-error тестовое окружение
		delete globalThis.window;

		assert.doesNotThrow(() => {
			initSiteClient();
		});

		globalThis.window = previousWindow;
	});
});
