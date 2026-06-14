#!/usr/bin/env node
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolvePackageDir } from './resolve-bin.js';

/** @type {(startDir: string) => string | null} */
function findGitDir(startDir) {
	let current = path.resolve(startDir);

	for (;;) {
		const gitPath = path.join(current, '.git');

		if (existsSync(gitPath)) {
			const stat = lstatSync(gitPath);

			if (stat.isDirectory()) {
				return gitPath;
			}

			const gitinfo = readFileSync(gitPath, 'utf8');
			const match = /gitdir: (.+)/.exec(gitinfo);

			if (match?.[1]) {
				return path.resolve(current, match[1].trim());
			}
		}

		const parent = path.resolve(current, '..');

		if (parent === current) {
			return null;
		}

		current = parent;
	}
}

/** @type {(hostRoot: string) => boolean} */
function hasPreCommitConfig(hostRoot) {
	try {
		const pkg = JSON.parse(readFileSync(path.join(hostRoot, 'package.json'), 'utf8'));
		const pre = pkg['pre-commit'] ?? pkg.precommit;

		if (Array.isArray(pre)) {
			return pre.length > 0;
		}

		if (pre && typeof pre === 'object' && 'run' in pre) {
			const { run } = pre;

			if (Array.isArray(run)) {
				return run.length > 0;
			}

			return Boolean(typeof run === 'string' && run.trim());
		}

		return Boolean(typeof pre === 'string' && pre.trim());
	} catch {
		return false;
	}
}

/**
 * На хосте @fastify/pre-commit nested в node_modules/site-core; штатный install.js
 * через file:-link резолвит __dirname в core и ставит hook не в тот .git.
 * Пишем hook вручную с абсолютным путём к index.js.
 *
 * @type {(hostRoot: string) => void}
 */
function installHostPreCommit(hostRoot) {
	const resolvedHost = path.resolve(hostRoot);
	const coreRoot = path.join(resolvedHost, 'node_modules', 'site-core');

	if (!existsSync(coreRoot) || !hasPreCommitConfig(resolvedHost)) {
		return;
	}

	const cli = resolvePreCommitCli(resolvedHost);

	if (!cli) {
		console.warn('site-core-postinstall: @fastify/pre-commit not found — skip pre-commit hook');
		return;
	}

	const gitDir = findGitDir(resolvedHost);

	if (!gitDir) {
		return;
	}

	const hooksDir = path.join(gitDir, 'hooks');
	const hookFile = path.join(hooksDir, 'pre-commit');

	if (!existsSync(hooksDir)) {
		mkdirSync(hooksDir, { recursive: true });
	}

	try {
		unlinkSync(hookFile);
	} catch {
		// ignore missing hook
	}

	const hookContent = [
		'#!/usr/bin/env bash',
		'if git diff --cached --quiet; then',
		'  echo "No staged changes detected, skipping pre-commit hook."',
		'  exit 0',
		'fi',
		`"${toPosixPath(process.execPath)}" "${toPosixPath(cli)}"`,
		'exit $?',
		'',
	].join('\n');

	writeFileSync(hookFile, hookContent, { mode: 0o755 });

	try {
		chmodSync(hookFile, 0o755);
	} catch {
		// Windows may reject chmod; hook still works in Git Bash
	}
}

/** @type {(hostRoot: string) => string | null} */
function resolvePreCommitCli(hostRoot) {
	const pkgDir = resolvePackageDir('@fastify/pre-commit', hostRoot);

	if (!pkgDir) {
		return null;
	}

	const cli = path.join(pkgDir, 'index.js');

	return existsSync(cli) ? cli : null;
}

/** @type {(filePath: string) => string} */
function toPosixPath(filePath) {
	return filePath.replace(/\\/g, '/');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	installHostPreCommit(process.cwd());
}

export { findGitDir, hasPreCommitConfig, installHostPreCommit, resolvePreCommitCli };
