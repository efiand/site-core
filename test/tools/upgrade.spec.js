import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { getRegistryPackageNames, isRegistryDependency } from '../../tools/upgrade.js';
import { parseSiteCoreGitPin, replaceSiteCoreWorkflowPins } from '../../tools/upgrade-site-core-pin.js';

describe('Инструменты/upgrade', () => {
	test('isRegistryDependency пропускает git, github и file', () => {
		assert.equal(isRegistryDependency('git+https://github.com/efiand/site-core.git#1.0.1'), false);
		assert.equal(isRegistryDependency('github:efiand/site-core#1.1.3'), false);
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

	test('parseSiteCoreGitPin разбирает git+https pin', () => {
		assert.deepEqual(parseSiteCoreGitPin('git+https://github.com/efiand/site-core.git#1.0.2'), {
			owner: 'efiand',
			repo: 'site-core',
			tag: '1.0.2',
		});
	});

	test('parseSiteCoreGitPin разбирает github: shorthand pin', () => {
		assert.deepEqual(parseSiteCoreGitPin('github:efiand/site-core#1.1.3'), {
			owner: 'efiand',
			repo: 'site-core',
			tag: '1.1.3',
		});
	});

	test('replaceSiteCoreWorkflowPins обновляет reusable site-core workflows', () => {
		const source = [
			'uses: efiand/site-core/.github/workflows/host-ci.yml@1.0.2',
			'uses: efiand/site-core/.github/workflows/deploy-static-releases.yml@1.0.2',
		].join('\n');
		const { changed, content } = replaceSiteCoreWorkflowPins(source, '1.1.0');

		assert.equal(changed, true);
		assert.match(content, /@1\.1\.0/g);
	});
});
