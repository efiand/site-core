import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { restoreRolldownWasmLockfile } from './restore-rolldown-wasm-lockfile.js';
import { fetchLatestReleaseTag } from './upgrade-github-actions.js';

const SITE_CORE_GIT_PIN = /^git\+(?:https|ssh):\/\/(?:git@)?github\.com\/([^/#]+)\/([^/#]+?)(?:\.git)?#([^/\s#]+)$/u;
const SITE_CORE_GITHUB_SHORTHAND = /^github:([^/#]+)\/([^/#]+)#([^/\s#]+)$/u;

const SITE_CORE_WORKFLOW_USES = /(uses:\s*[\w.-]+\/site-core\/\.github\/workflows\/[\w.-]+\.yml)@[^\s#]+/gu;

/** @type {(specifier: string) => { owner: string, repo: string, tag: string } | null} */
function parseSiteCoreGitPin(specifier) {
	if (typeof specifier !== 'string') {
		return null;
	}

	const trimmed = specifier.trim();
	const match = trimmed.match(SITE_CORE_GIT_PIN) ?? trimmed.match(SITE_CORE_GITHUB_SHORTHAND);

	if (!match) {
		return null;
	}

	const [, owner, repo, tag] = match;

	return { owner, repo, tag };
}

/** @type {(content: string, tag: string) => { changed: boolean, content: string }} */
function replaceSiteCoreWorkflowPins(content, tag) {
	let changed = false;
	const nextContent = content.replace(SITE_CORE_WORKFLOW_USES, (line, prefix) => {
		const nextLine = `${prefix}@${tag}`;

		if (nextLine !== line) {
			changed = true;
		}

		return nextLine;
	});

	return { changed, content: nextContent };
}

/** @type {(cwd?: string) => Promise<void>} */
async function upgradeSiteCorePin(cwd = process.cwd()) {
	const packageJsonPath = path.join(cwd, 'package.json');
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
	const specifier = packageJson.dependencies?.['site-core'];

	if (!specifier) {
		return;
	}

	const gitPin = parseSiteCoreGitPin(specifier);

	if (!gitPin) {
		console.info('site-core-upgrade: site-core не git pin — skip bump');
		return;
	}

	const latestTag = await fetchLatestReleaseTag(gitPin.owner, gitPin.repo);

	if (latestTag === gitPin.tag) {
		console.info(`site-core-upgrade: site-core уже на ${latestTag}`);
		return;
	}

	packageJson.dependencies['site-core'] = specifier.replace(/#[^/\s#]+$/u, `#${latestTag}`);
	writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, '\t')}\n`);

	const workflowsDir = path.join(cwd, '.github', 'workflows');

	try {
		for (const fileName of readdirSync(workflowsDir).filter((entry) => entry.endsWith('.yml'))) {
			const filePath = path.join(workflowsDir, fileName);
			const source = readFileSync(filePath, 'utf8');
			const { changed, content } = replaceSiteCoreWorkflowPins(source, latestTag);

			if (changed) {
				writeFileSync(filePath, content);
				console.info(`${fileName}: site-core reusable workflows → @${latestTag}`);
			}
		}
	} catch {
		// consumer без .github/workflows
	}

	console.info(`site-core-upgrade: site-core ${gitPin.tag} → ${latestTag}`);
	execSync('npm install', { cwd, stdio: 'inherit' });
	restoreRolldownWasmLockfile(cwd);
}

export { parseSiteCoreGitPin, replaceSiteCoreWorkflowPins, upgradeSiteCorePin };
