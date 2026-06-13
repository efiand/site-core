#!/usr/bin/env node
/// <reference path="../types/index.d.ts" />

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { restoreRolldownWasmLockfile } from './restore-rolldown-wasm-lockfile.js';
import { upgradeGitHubActions } from './upgrade-github-actions.js';

const hostCwd = process.cwd();
const pkg = JSON.parse(readFileSync(path.join(hostCwd, 'package.json'), 'utf8'));
const { dependencies = {}, devDependencies = {} } = pkg;

for (const [packages, devFlag] of [
	[dependencies, ''],
	[devDependencies, 'D'],
]) {
	const list = Object.keys(packages);

	if (list.length) {
		execSync(`npm i -${devFlag}E ${list.join('@latest ')}@latest`, { cwd: hostCwd, stdio: 'inherit' });
	}
}

execSync('npx update-browserslist-db@latest --yes', { cwd: hostCwd, stdio: 'inherit' });
restoreRolldownWasmLockfile(hostCwd);
await upgradeGitHubActions();
