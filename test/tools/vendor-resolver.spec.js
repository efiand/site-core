import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const coreRoot = fileURLToPath(new URL('../..', import.meta.url));
const registerVendors = pathToFileURL(path.join(coreRoot, 'tools/register-vendors.js')).href;

/** @type {(hostRoot: string) => void} */
function writeHostPackageJson(hostRoot) {
	fs.writeFileSync(
		path.join(hostRoot, 'package.json'),
		JSON.stringify({ name: 'test-host', private: true, type: 'module' }),
	);
}

/** @type {(pkgDir: string, relEntry: string) => void} */
function writeHtmlValidateStub(pkgDir, relEntry) {
	fs.mkdirSync(path.dirname(path.join(pkgDir, relEntry)), { recursive: true });
	fs.writeFileSync(
		path.join(pkgDir, 'package.json'),
		JSON.stringify({
			exports: { '.': `./${relEntry.replace(/\\/g, '/')}` },
			name: 'html-validate',
			private: true,
			type: 'module',
		}),
	);
	fs.writeFileSync(path.join(pkgDir, relEntry), 'export const vendorResolverProbe = "hoisted-host";\n');
}

describe('Инструменты/vendor-resolver', () => {
	test('register-vendors резолвит html-validate из hoisted node_modules хоста', () => {
		const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-vendor-'));
		const pkgDir = path.join(hostRoot, 'node_modules/html-validate');

		writeHostPackageJson(hostRoot);
		writeHtmlValidateStub(pkgDir, 'dist/esm/index.js');

		const probe = [
			"import('html-validate').then((m) => {",
			"  if (m.vendorResolverProbe !== 'hoisted-host') process.exit(2);",
			"  console.log('ok');",
			'}).catch((e) => { console.error(e); process.exit(1); });',
		].join('\n');

		try {
			const result = spawnSync(process.execPath, ['--import', registerVendors, '-e', probe], {
				cwd: hostRoot,
				encoding: 'utf8',
			});

			assert.equal(result.status, 0, result.stderr || result.stdout);
			assert.match(result.stdout, /ok/);
		} finally {
			fs.rmSync(hostRoot, { force: true, recursive: true });
		}
	});
});
