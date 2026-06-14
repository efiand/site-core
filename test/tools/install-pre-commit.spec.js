import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { findGitDir, hasPreCommitConfig, resolvePreCommitCli } from '../../tools/install-pre-commit.js';

const coreRoot = fileURLToPath(new URL('../..', import.meta.url));

/** @type {(hostRoot: string) => void} */
function writeHostPackageJson(hostRoot) {
	fs.writeFileSync(path.join(hostRoot, 'package.json'), JSON.stringify({ name: 'test-host', private: true }));
}

/** @type {(cliPath: string) => void} */
function writePreCommitStub(cliPath) {
	fs.mkdirSync(path.dirname(cliPath), { recursive: true });
	fs.writeFileSync(
		path.join(path.dirname(cliPath), 'package.json'),
		JSON.stringify({ name: '@fastify/pre-commit', private: true }),
	);
	fs.writeFileSync(cliPath, '');
}

describe('Инструменты/install-pre-commit', () => {
	test('findGitDir находит .git site-core', () => {
		const gitDir = findGitDir(coreRoot);

		assert.ok(gitDir?.endsWith('.git'));
	});

	test('hasPreCommitConfig true для site-core package.json', () => {
		assert.equal(hasPreCommitConfig(coreRoot), true);
	});

	test('resolvePreCommitCli fallback на node_modules site-core при file:-link', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-precommit-'));
		const expected = path.join(coreRoot, 'node_modules/@fastify/pre-commit/index.js');

		writeHostPackageJson(hostRoot);

		try {
			assert.ok(fs.existsSync(expected));
			assert.equal(resolvePreCommitCli(hostRoot), expected);
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});

	test('resolvePreCommitCli находит @fastify/pre-commit в hoisted node_modules consumer-проекта', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-precommit-'));
		const cliPath = path.join(hostRoot, 'node_modules/@fastify/pre-commit/index.js');

		writeHostPackageJson(hostRoot);
		writePreCommitStub(cliPath);

		try {
			assert.equal(resolvePreCommitCli(hostRoot), cliPath);
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});
});
