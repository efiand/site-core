#!/usr/bin/env node
/// <reference path="../types/index.d.ts" />

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { restoreRolldownWasmLockfile } from './restore-rolldown-wasm-lockfile.js';
import { upgradeGitHubActions } from './upgrade-github-actions.js';

const NON_REGISTRY_SPECIFIER = /^(?:git\+|git:|file:|link:|workspace:|npm:|https?:)/u;

/** @type {(packages: Record<string, string>) => string[]} */
function getRegistryPackageNames(packages) {
	return Object.entries(packages)
		.filter(([, version]) => isRegistryDependency(version))
		.map(([name]) => name);
}

/** @type {(version: string) => boolean} */
function isRegistryDependency(version) {
	return typeof version === 'string' && !NON_REGISTRY_SPECIFIER.test(version.trim());
}

/** @type {(cwd?: string) => Promise<void>} */
async function runUpgrade(cwd = process.cwd()) {
	upgradeRegistryDependencies(cwd);
	execSync('npx update-browserslist-db@latest --yes', { cwd, stdio: 'inherit' });
	restoreRolldownWasmLockfile(cwd);
	await upgradeGitHubActions();
}

/** @type {(cwd: string) => void} */
function upgradeRegistryDependencies(cwd) {
	const { dependencies = {}, devDependencies = {} } = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'));

	for (const [packages, devFlag] of [
		[dependencies, ''],
		[devDependencies, 'D'],
	]) {
		const names = getRegistryPackageNames(packages);

		if (!names.length) {
			continue;
		}

		execSync(`npm i -${devFlag}E ${names.map((name) => `${name}@latest`).join(' ')}`, { cwd, stdio: 'inherit' });
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	await runUpgrade(process.cwd());
}

export { getRegistryPackageNames, isRegistryDependency, runUpgrade };
