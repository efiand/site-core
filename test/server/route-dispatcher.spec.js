import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { resolveRouteKey } from '#core/server/lib/route-dispatcher.js';

describe('Сервер/Маршрутизация', () => {
	test('resolveRouteKey для статических и динамических маршрутов', () => {
		assert.deepStrictEqual(resolveRouteKey('/order'), { id: Number.NaN, routeKey: '/order' });
		assert.deepStrictEqual(resolveRouteKey('/recipes/42'), { id: 42, routeKey: '/recipes/:id' });
		assert.deepStrictEqual(resolveRouteKey('/api/pages/7'), { id: 7, routeKey: '/api/pages/:id' });
	});
});
