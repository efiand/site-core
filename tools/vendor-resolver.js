import { isBuiltin } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const siteCoreRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendorRoot = path.join(siteCoreRoot, 'node_modules');

const VENDORS = new Set(['fast-xml-validator', 'html-validate', 'posthtml-bem-linter', 'rolldown']);

/** @type {Record<string, string>} */
const PKG_ENTRIES = {
	'fast-xml-validator': 'src/fxv.js',
	'html-validate': 'dist/esm/index.js',
	'posthtml-bem-linter': 'index.js',
};

/** @type {import('node:module').ResolveHook} */
async function resolve(specifier, context, nextResolve) {
	if (isBuiltin(specifier) || specifier.startsWith('node:') || specifier.startsWith('#')) {
		return nextResolve(specifier, context);
	}

	const [pkgName, ...subpath] = specifier.split('/');
	if (!VENDORS.has(pkgName)) {
		return nextResolve(specifier, context);
	}

	const pkgDir = path.join(vendorRoot, pkgName);
	const entry = subpath.length ? path.join(pkgDir, ...subpath) : path.join(pkgDir, PKG_ENTRIES[pkgName] ?? '');

	return nextResolve(pathToFileURL(entry).href, context);
}

export { resolve };
