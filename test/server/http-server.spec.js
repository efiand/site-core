import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { afterEach, describe, test } from 'node:test';
import { closeApp, waitForApp } from '#core/server/lib/http-server.js';

/** @type {import('node:http').Server | undefined} */
let server;

describe('Сервер/HTTP-сервер', () => {
	afterEach(async () => {
		await closeApp(server);
		server = undefined;
	});

	test('waitForApp дожидается listen', async () => {
		server = createServer(() => {});
		server.listen(0, 'localhost');

		await waitForApp(server);

		assert.strictEqual(server.listening, true);
	});

	test('waitForApp сразу резолвится, если сервер уже слушает', async () => {
		server = createServer(() => {});
		server.listen(0, 'localhost');
		await waitForApp(server);

		await waitForApp(server);

		assert.strictEqual(server.listening, true);
	});
});
