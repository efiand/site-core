import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { SITE_CORE_VERSION, buildAssetQuery } from '#core/common/lib/asset-version.js';

describe('Общее/asset-version', () => {
	test('buildAssetQuery объединяет версию хоста и semver site-core', () => {
		const query = buildAssetQuery(32);

		assert.match(query, /^\?v=32&core=/);
		assert.match(query, new RegExp(`core=${SITE_CORE_VERSION.replace(/\./g, '\\.')}$`));
	});
});
