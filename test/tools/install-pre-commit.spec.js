import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { findGitDir, hasPreCommitConfig, resolvePreCommitCli } from '../../tools/install-pre-commit.js';

const coreRoot = fileURLToPath(new URL('../..', import.meta.url));
const efiandRoot = fileURLToPath(new URL('../../../efiand.ru', import.meta.url));

describe('Инструменты/install-pre-commit', () => {
	test('findGitDir находит .git site-core', () => {
		const gitDir = findGitDir(coreRoot);

		assert.ok(gitDir?.endsWith('.git'));
	});

	test('hasPreCommitConfig true для site-core package.json', () => {
		assert.equal(hasPreCommitConfig(coreRoot), true);
	});

	test('resolvePreCommitCli находит @fastify/pre-commit на хосте', () => {
		if (!existsSync(efiandRoot)) {
			return;
		}

		const cli = resolvePreCommitCli(efiandRoot);

		assert.match(cli ?? '', /@fastify[/\\]pre-commit[/\\]index\.js$/);
	});
});
