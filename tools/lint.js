#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { runLintStaticCheck } from './lint-static-check.js';
import { resolveBinSpawn } from './resolve-bin.js';

const hostCwd = process.cwd();

/** @type {(name: string, args: string[]) => void} */
function runBin(name, args) {
	const { command, args: spawnArgs } = resolveBinSpawn(name, args, hostCwd);
	const result = spawnSync(command, spawnArgs, { cwd: hostCwd, stdio: 'inherit' });

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

runLintStaticCheck(hostCwd);
runBin('biome', ['check', ...process.argv.slice(2)]);
