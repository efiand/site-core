#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveBinSpawn } from './resolve-bin.js';

/** @param {string} [cwd=process.cwd()] */
function runTypeCheck(cwd = process.cwd()) {
	const { command, args } = resolveBinSpawn('tsc', ['-p', './tsconfig.json'], cwd);
	const result = spawnSync(command, args, { cwd, stdio: 'inherit' });

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	runTypeCheck(process.cwd());
}

export { runTypeCheck };
