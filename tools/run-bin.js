#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolveBinSpawn } from './resolve-bin.js';

const [name, ...args] = process.argv.slice(2);

if (!name) {
	console.error('Usage: site-core-run <cli-name> [...args]');
	process.exit(1);
}

const hostCwd = process.cwd();
const { command, args: spawnArgs } = resolveBinSpawn(name, args, hostCwd);
const result = spawnSync(command, spawnArgs, { cwd: hostCwd, stdio: 'inherit' });

process.exit(result.status ?? 1);
