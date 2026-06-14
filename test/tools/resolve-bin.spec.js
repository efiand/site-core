import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { resolveBinSpawn, resolvePackageDir } from '../../tools/resolve-bin.js';

const coreRoot = fileURLToPath(new URL('../..', import.meta.url));

/** @type {(hostRoot: string) => void} */
function writeHostPackageJson(hostRoot) {
	fs.writeFileSync(path.join(hostRoot, 'package.json'), JSON.stringify({ name: 'test-host', private: true }));
}

/** @type {(pkgDir: string, pkgName: string, relEntry: string) => void} */
function writeVendorStub(pkgDir, pkgName, relEntry) {
	fs.mkdirSync(path.dirname(path.join(pkgDir, relEntry)), { recursive: true });
	fs.writeFileSync(
		path.join(pkgDir, 'package.json'),
		JSON.stringify({
			exports: { '.': `./${relEntry.replace(/\\/g, '/')}` },
			name: pkgName,
			private: true,
			type: 'module',
		}),
	);
	fs.writeFileSync(path.join(pkgDir, relEntry), 'export const ok = true;\n');
}

describe('Инструменты/resolve-bin', () => {
	test('resolvePackageDir находит html-validate в nested node_modules site-core (file:-link)', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-resolve-'));
		const expected = path.join(coreRoot, 'node_modules/html-validate');

		writeHostPackageJson(hostRoot);

		try {
			assert.ok(fs.existsSync(path.join(expected, 'package.json')));
			assert.equal(resolvePackageDir('html-validate', hostRoot), expected);
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});

	test('resolvePackageDir находит html-validate в hoisted node_modules consumer-проекта (git pin)', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-resolve-'));
		const expected = path.join(hostRoot, 'node_modules/html-validate');

		writeHostPackageJson(hostRoot);
		writeVendorStub(expected, 'html-validate', 'dist/esm/index.js');

		try {
			assert.equal(resolvePackageDir('html-validate', hostRoot), expected);
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});

	test('resolvePackageDir находит @biomejs/biome (CLI-only, без main/exports)', () => {
		const expected = path.join(coreRoot, 'node_modules/@biomejs/biome');

		assert.ok(fs.existsSync(path.join(expected, 'package.json')));
		assert.equal(resolvePackageDir('@biomejs/biome', coreRoot), expected);
	});

	test('resolveBinSpawn находит biome на Windows без shell', () => {
		const { args, command } = resolveBinSpawn('biome', ['check'], coreRoot);

		assert.equal(command, process.execPath);
		assert.match(args[0], /[/\\]@biomejs[/\\]biome[/\\]bin[/\\]biome$/);
		assert.equal(args[1], 'check');
	});

	test('resolvePackageDir находит fast-xml-validator в hoisted node_modules consumer-проекта', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-resolve-'));
		const expected = path.join(hostRoot, 'node_modules/fast-xml-validator');

		writeHostPackageJson(hostRoot);
		writeVendorStub(expected, 'fast-xml-validator', 'src/fxv.js');

		try {
			assert.equal(resolvePackageDir('fast-xml-validator', hostRoot), expected);
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});
});
