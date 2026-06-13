import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { STATIC_MIME_TYPES, staticExtensions } from '#core/common/lib/static-mime-types.js';

describe('Общее/static-mime-types', () => {
	test('staticExtensions совпадает с ключами STATIC_MIME_TYPES', () => {
		assert.deepStrictEqual(staticExtensions, new Set(Object.keys(STATIC_MIME_TYPES)));
	});
});
