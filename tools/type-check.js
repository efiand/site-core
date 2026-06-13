#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolveBinSpawn } from './resolve-bin.js';

const hostCwd = process.cwd();
const { command, args } = resolveBinSpawn('tsc', ['-p', './tsconfig.json'], hostCwd);
const result = spawnSync(command, args, { cwd: hostCwd, stdio: 'inherit' });

process.exit(result.status ?? 1);
