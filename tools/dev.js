#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveBinSpawn } from './resolve-bin.js';

const siteCoreRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const devServer = path.join(siteCoreRoot, 'tools', 'dev-server.js');
const nodemonConfig = path.join(siteCoreRoot, 'config', 'nodemon.host.json');
const isPreview = process.argv.includes('--preview');
const hostCwd = process.cwd();

/** @type {(name: string, args: string[]) => import('node:child_process').SpawnSyncReturns<Buffer | null>} */
function spawnCli(name, args) {
	const { command, args: spawnArgs } = resolveBinSpawn(name, args, hostCwd);

	return spawnSync(command, spawnArgs, {
		cwd: hostCwd,
		env: {
			...process.env,
			DEV: 'true',
			...(isPreview ? { PREVIEW: 'true' } : {}),
		},
		stdio: 'inherit',
	});
}

if (isPreview) {
	const result = spawnCli('dotenvx', ['run', '--', process.execPath, devServer]);
	process.exit(result.status ?? 1);
}

const { args: nodemonArgs } = resolveBinSpawn('nodemon', ['--config', nodemonConfig, devServer], hostCwd);
const result = spawnCli('dotenvx', ['run', '--', process.execPath, ...nodemonArgs]);

process.exit(result.status ?? 1);
