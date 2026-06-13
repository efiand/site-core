import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createRouteParams } from '#core/test-helpers/route-params.js';

describe('Хелперы/route-params', () => {
	test('createRouteParams подмешивает overrides', () => {
		const params = createRouteParams({ id: 7, isAuthorized: true });

		assert.strictEqual(params.id, 7);
		assert.strictEqual(params.isAuthorized, true);
		assert.deepStrictEqual(params.body, {});
	});
});
