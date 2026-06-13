import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { getStaticRoot, resolveStaticPath, sendReload } from '#core/server/lib/dev-middleware.js';

describe('Сервер/dev-middleware', () => {
	it('getStaticRoot мапит пути ассетов в dev', () => {
		assert.equal(getStaticRoot('/client/css/main.css', true), './src');
		assert.equal(getStaticRoot('/common/lib/foo.js', true), './app');
		assert.equal(getStaticRoot('/components/widget.js', true), './app');
		assert.equal(getStaticRoot('/core/common/lib/log.js', true), './node_modules/site-core');
		assert.equal(getStaticRoot('/favicon.ico', true), './public');
	});

	it('getStaticRoot в prod отдаёт public', () => {
		assert.equal(getStaticRoot('/client/css/main.css', false), './public');
	});

	it('resolveStaticPath убирает префикс /core/', () => {
		const cwd = '/project';
		assert.equal(
			resolveStaticPath('/core/common/lib/log.js', cwd, true),
			path.join(cwd, 'node_modules/site-core/common/lib/log.js'),
		);
	});

	it('sendReload шлёт reload только на первое SSE-подключение после рестарта', () => {
		/** @type {string[]} */
		const chunks = [];
		const res = {
			write: (/** @type {string} */ chunk) => {
				chunks.push(String(chunk));
				return true;
			},
			writeHead: () => res,
		};
		const response = /** @type {RouteResponse} */ (/** @type {unknown} */ (res));

		sendReload(response);
		assert.match(chunks.join(''), /data: reload/);

		chunks.length = 0;
		sendReload(response);
		assert.doesNotMatch(chunks.join(''), /data: reload/);
	});
});
