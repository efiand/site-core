import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { resolveHostCwd, restoreRolldownWasmLockfile } from '../../tools/restore-rolldown-wasm-lockfile.js';

const WASM_BINDING_KEY = 'node_modules/@rolldown/binding-wasm32-wasi';

/** @type {(hostRoot: string, packages: Record<string, unknown>) => void} */
function writeLockfile(hostRoot, packages) {
	fs.writeFileSync(
		path.join(hostRoot, 'package-lock.json'),
		`${JSON.stringify({ lockfileVersion: 3, name: 'test-host', packages, version: '1.0.0' }, null, '\t')}\n`,
	);
}

describe('Инструменты/restore-rolldown-wasm-lockfile', () => {
	test('restoreRolldownWasmLockfile дописывает top-level @emnapi/* из nested lock-записей', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-wasm-lock-'));
		const nestedCore = {
			dependencies: {
				'@emnapi/wasi-threads': '1.2.2',
				tslib: '^2.4.0',
			},
			integrity: 'sha512-core',
			license: 'MIT',
			optional: true,
			resolved: 'https://registry.npmjs.org/@emnapi/core/-/core-1.11.0.tgz',
			version: '1.11.0',
		};
		const nestedRuntime = {
			dependencies: {
				tslib: '^2.4.0',
			},
			integrity: 'sha512-runtime',
			license: 'MIT',
			optional: true,
			resolved: 'https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.11.0.tgz',
			version: '1.11.0',
		};

		writeLockfile(hostRoot, {
			[WASM_BINDING_KEY]: {
				dependencies: {
					'@emnapi/core': '1.11.0',
					'@emnapi/runtime': '1.11.0',
				},
			},
			[`${WASM_BINDING_KEY}/node_modules/@emnapi/core`]: nestedCore,
			[`${WASM_BINDING_KEY}/node_modules/@emnapi/runtime`]: nestedRuntime,
		});

		try {
			restoreRolldownWasmLockfile(hostRoot);

			const lock = JSON.parse(fs.readFileSync(path.join(hostRoot, 'package-lock.json'), 'utf8'));

			assert.deepEqual(lock.packages['node_modules/@emnapi/core'], {
				dependencies: {
					'@emnapi/wasi-threads': '1.2.2',
					tslib: '^2.4.0',
				},
				dev: true,
				integrity: nestedCore.integrity,
				license: 'MIT',
				optional: true,
				peer: true,
				resolved: nestedCore.resolved,
				version: '1.11.0',
			});
			assert.deepEqual(lock.packages['node_modules/@emnapi/runtime'], {
				dependencies: {
					tslib: '^2.4.0',
				},
				dev: true,
				integrity: nestedRuntime.integrity,
				license: 'MIT',
				optional: true,
				peer: true,
				resolved: nestedRuntime.resolved,
				version: '1.11.0',
			});
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});

	test('restoreRolldownWasmLockfile без package-lock.json не падает', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-wasm-lock-'));

		try {
			restoreRolldownWasmLockfile(hostRoot);
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});

	test('resolveHostCwd предпочитает INIT_CWD', () => {
		const previousInitCwd = process.env.INIT_CWD;

		process.env.INIT_CWD = path.join(os.tmpdir(), 'consumer-root');

		try {
			assert.equal(resolveHostCwd(), process.env.INIT_CWD);
		} finally {
			if (previousInitCwd === undefined) {
				delete process.env.INIT_CWD;
			} else {
				process.env.INIT_CWD = previousInitCwd;
			}
		}
	});
});
