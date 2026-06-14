import { accessSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteCoreRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SYSTEM_BINS = new Set(['node', 'npm', 'npx']);

/** @type {Record<string, string>} */
const CLI_PACKAGES = {
	biome: '@biomejs/biome',
	dotenvx: '@dotenvx/dotenvx',
	nodemon: 'nodemon',
	postcss: 'postcss-cli',
	rolldown: 'rolldown',
	tsc: 'typescript',
};

/** @type {(entryPath: string, pkgName: string) => string | null} */
function findPackageRoot(entryPath, pkgName) {
	let dir = path.dirname(entryPath);

	for (;;) {
		const pkgJsonPath = path.join(dir, 'package.json');

		try {
			accessSync(pkgJsonPath);
			const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));

			if (pkg.name === pkgName) {
				return dir;
			}
		} catch {
			// keep walking up
		}

		const parent = path.dirname(dir);

		if (parent === dir) {
			return null;
		}

		dir = parent;
	}
}

/**
 * @param {string} name CLI name without extension (e.g. `tsc`, `biome`)
 * @param {string} [hostCwd=process.cwd()]
 * @returns {string}
 */
function resolveBin(name, hostCwd = process.cwd()) {
	if (name === 'node') {
		return process.execPath;
	}

	const fileName = process.platform === 'win32' ? `${name}.cmd` : name;
	const candidates = [
		path.join(hostCwd, 'node_modules', '.bin', fileName),
		path.join(siteCoreRoot, 'node_modules', '.bin', fileName),
	];

	for (const binPath of candidates) {
		try {
			accessSync(binPath);
			return binPath;
		} catch {
			// try next
		}
	}

	if (SYSTEM_BINS.has(name)) {
		return name;
	}

	throw new Error(`CLI "${name}" not found. Run npm install in the host project.`);
}

/** @type {(cliName: string, hostCwd: string) => string | null} */
function resolveBinScript(cliName, hostCwd) {
	const pkgName = CLI_PACKAGES[cliName] ?? cliName;
	const pkgDir = resolvePackageDir(pkgName, hostCwd);

	if (!pkgDir) {
		return null;
	}

	const pkg = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
	const { bin } = pkg;

	if (!bin) {
		return null;
	}

	const rel = typeof bin === 'string' ? bin : bin[cliName];

	if (!rel) {
		return null;
	}

	return path.resolve(pkgDir, rel);
}

/**
 * Пара command/args для `spawnSync` без `shell: true` (DEP0190 на Windows).
 *
 * @param {string} cliName
 * @param {string[]} [cliArgs=[]]
 * @param {string} [hostCwd=process.cwd()]
 * @returns {{ command: string, args: string[] }}
 */
function resolveBinSpawn(cliName, cliArgs = [], hostCwd = process.cwd()) {
	if (cliName === 'node') {
		return { args: cliArgs, command: process.execPath };
	}

	if (SYSTEM_BINS.has(cliName)) {
		return { args: cliArgs, command: cliName };
	}

	const script = resolveBinScript(cliName, hostCwd);

	if (script) {
		return { args: [script, ...cliArgs], command: process.execPath };
	}

	if (process.platform === 'win32') {
		throw new Error(`Cannot resolve "${cliName}" without shell on Windows. Add it to CLI_PACKAGES in resolve-bin.js.`);
	}

	return { args: cliArgs, command: resolveBin(cliName, hostCwd) };
}

/** @type {(pkgName: string, hostCwd: string) => string | null} */
function resolvePackageDir(pkgName, hostCwd) {
	for (const root of [hostCwd, siteCoreRoot]) {
		try {
			const require = createRequire(path.join(root, 'package.json'));
			const entryPath = require.resolve(pkgName);
			const pkgDir = findPackageRoot(entryPath, pkgName);

			if (pkgDir) {
				return pkgDir;
			}
		} catch {
			// try next
		}
	}

	return null;
}

export { resolveBin, resolveBinSpawn, resolvePackageDir };
