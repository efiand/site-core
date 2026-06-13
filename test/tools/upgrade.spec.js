import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { getRegistryPackageNames, isRegistryDependency } from '../../tools/upgrade.js';

describe('Инструменты/upgrade', () => {
	test('isRegistryDependency пропускает git и file', () => {
		assert.equal(isRegistryDependency('git+https://github.com/efiand/site-core.git#1.0.1'), false);
		assert.equal(isRegistryDependency('file:../site-core'), false);
		assert.equal(isRegistryDependency('^1.0.1'), true);
		assert.equal(isRegistryDependency('latest'), true);
	});

	test('getRegistryPackageNames оставляет только registry-зависимости', () => {
		assert.deepEqual(
			getRegistryPackageNames({
				'@biomejs/biome': '^2.5.0',
				'site-core': 'git+https://github.com/efiand/site-core.git#1.0.1',
			}),
			['@biomejs/biome'],
		);
	});
});
