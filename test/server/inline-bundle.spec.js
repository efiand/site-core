import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { getCss, getJs } from '#core/server/lib/inline-bundle.js';

const fixtureRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/inline-host');

describe('Сервер/Inline-bundle', () => {
	test('getCss обрабатывает CSS entry через postcss.config хоста', async () => {
		const css = await getCss('main.css', { cwd: fixtureRoot });

		assert.match(css, /color:\s*red/);
	});

	test('getJs собирает JS entry через rolldown', async () => {
		const js = await getJs('entries/main.js', { cwd: fixtureRoot });

		assert.match(js, /fixtureValue/);
	});
});
