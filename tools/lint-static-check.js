import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFunctionOrderCheck } from './check-function-order.js';
import { runTypeCheck } from './type-check.js';

const siteCoreRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @type {(cwd: string, options?: { ensureGeneratedFonts?: boolean }) => void} */
function runLintStaticCheck(cwd, { ensureGeneratedFonts = false } = {}) {
	if (ensureGeneratedFonts) {
		runNodeScript('tools/ensure-generated-fonts.js', cwd);
	}

	runTypeCheck(cwd);
	runFunctionOrderCheck(cwd);
}

/** @type {(scriptRel: string, cwd: string) => void} */
function runNodeScript(scriptRel, cwd) {
	const result = spawnSync(process.execPath, [path.join(siteCoreRoot, scriptRel)], {
		cwd,
		stdio: 'inherit',
	});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

export { runLintStaticCheck };
