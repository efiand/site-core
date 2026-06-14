import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { findGitDir, hasPreCommitConfig, resolvePreCommitCli } from '../../tools/install-pre-commit.js';

const coreRoot = fileURLToPath(new URL('../..', import.meta.url));

describe('Инструменты/install-pre-commit', () => {
	test('findGitDir находит .git site-core', () => {
		const gitDir = findGitDir(coreRoot);

		assert.ok(gitDir?.endsWith('.git'));
	});

	test('hasPreCommitConfig true для site-core package.json', () => {
		assert.equal(hasPreCommitConfig(coreRoot), true);
	});

	test('resolvePreCommitCli находит @fastify/pre-commit в nested node_modules consumer-проекта', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-precommit-'));
		const cliPath = path.join(hostRoot, 'node_modules/site-core/node_modules/@fastify/pre-commit/index.js');

		fs.mkdirSync(path.dirname(cliPath), { recursive: true });
		fs.writeFileSync(cliPath, '');

		try {
			assert.equal(resolvePreCommitCli(hostRoot), cliPath);
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});
});
