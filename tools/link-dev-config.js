import fs from 'node:fs';
import path from 'node:path';

const CORE_BIOME_BIN_PREFIX = './node_modules/@biomejs/';
const CORE_WORKFLOW_SCHEMA = './config/github-workflow.schema.json';

/**
 * Symlink на core — если содержимое на хосте 1:1.
 * settings.json — исключение: в `biome.lsp.bin` у хоста nested-путь
 * (`node_modules/site-core/node_modules/…`), у site-core — прямой (`node_modules/…`);
 * VS Code не умеет extends для settings → postinstall пишет копию с подстановкой.
 */
/** @type {Array<{ link: string; target: string }>} */
const DEFAULT_LINKS = [
	{ link: '.cursor/rules/site-core', target: '.cursor/rules' },
	{ link: '.editorconfig', target: '.editorconfig' },
	{ link: '.vscode/extensions.json', target: '.vscode/extensions.json' },
];

const HOST_BIOME_BIN_PREFIX = './node_modules/site-core/node_modules/@biomejs/';
const HOST_WORKFLOW_SCHEMA = './node_modules/site-core/config/github-workflow.schema.json';

/** @type {(hostRoot: string, linkPath: string, targetPath: string) => void} */
function ensureLink(hostRoot, linkPath, targetPath) {
	if (!fs.existsSync(targetPath)) {
		console.warn(`site-core-postinstall: skip missing ${path.relative(hostRoot, targetPath)}`);
		return;
	}

	if (isValidLink(linkPath, targetPath)) {
		return;
	}

	fs.mkdirSync(path.dirname(linkPath), { recursive: true });

	try {
		fs.rmSync(linkPath, { force: true, recursive: true });
	} catch {
		// ignore
	}

	const linkType = fs.statSync(targetPath).isDirectory() ? (process.platform === 'win32' ? 'junction' : 'dir') : 'file';

	try {
		if (linkType === 'file' && process.platform === 'win32') {
			fs.linkSync(targetPath, linkPath);
		} else {
			fs.symlinkSync(targetPath, linkPath, linkType);
		}
	} catch (error) {
		if (
			linkType === 'file' &&
			process.platform === 'win32' &&
			/** @type {NodeJS.ErrnoException} */ (error).code === 'EPERM'
		) {
			fs.copyFileSync(targetPath, linkPath);
			console.warn(
				`Copied ${path.relative(hostRoot, linkPath)} (symlink unavailable; re-run postinstall after site-core updates)`,
			);
			return;
		}

		throw error;
	}

	console.info(`Linked ${path.relative(hostRoot, linkPath)} → ${path.relative(hostRoot, targetPath)}`);
}

/** @type {(linkPath: string, targetPath: string) => boolean} */
function isValidLink(linkPath, targetPath) {
	try {
		if (!fs.existsSync(linkPath) || !fs.existsSync(targetPath)) {
			return false;
		}

		return fs.realpathSync(linkPath) === fs.realpathSync(targetPath);
	} catch {
		return false;
	}
}

/** @type {(hostRoot?: string, links?: Array<{ link: string; target: string }>) => void} */
function linkDevConfig(hostRoot = process.cwd(), links = DEFAULT_LINKS) {
	const coreRoot = path.join(hostRoot, 'node_modules', 'site-core');

	if (!fs.existsSync(coreRoot)) {
		return;
	}

	for (const { link, target } of links) {
		ensureLink(hostRoot, path.join(hostRoot, link), path.join(coreRoot, target));
	}

	writeHostVscodeSettings(hostRoot, coreRoot);
}

/** @type {(hostRoot: string, coreRoot: string) => void} */
function writeHostVscodeSettings(hostRoot, coreRoot) {
	const sourcePath = path.join(coreRoot, '.vscode/settings.json');
	const destPath = path.join(hostRoot, '.vscode/settings.json');

	if (!fs.existsSync(sourcePath)) {
		console.warn(`site-core-postinstall: skip missing ${path.relative(hostRoot, sourcePath)}`);
		return;
	}

	const patched = fs
		.readFileSync(sourcePath, 'utf8')
		.replaceAll(CORE_BIOME_BIN_PREFIX, HOST_BIOME_BIN_PREFIX)
		.replaceAll(CORE_WORKFLOW_SCHEMA, HOST_WORKFLOW_SCHEMA);

	fs.mkdirSync(path.dirname(destPath), { recursive: true });

	try {
		fs.rmSync(destPath, { force: true, recursive: true });
	} catch {
		// ignore
	}

	fs.writeFileSync(destPath, patched, 'utf8');
	console.info(`Wrote ${path.relative(hostRoot, destPath)}`);
}

export { DEFAULT_LINKS, linkDevConfig };
