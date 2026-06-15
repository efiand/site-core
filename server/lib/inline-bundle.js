import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import postcss from 'postcss';
import postcssBaseConfig from '../../config/postcss.base.js';

/**
 * Общий promise импорта rolldown для параллельных вызовов getJs.
 *
 * @type {Promise<typeof import('rolldown')> | null}
 */
let rolldownLoad = null;

/** @type {(entryPoint: string, options?: InlineBundleOptions) => Promise<string>} */
async function getCss(entryPoint, { cwd = process.cwd() } = {}) {
	const from = path.join(cwd, 'src/client/css', entryPoint);
	const cssCode = await readFile(from, 'utf-8');
	const postcssConfig = await loadPostcssConfig(cwd);

	return (await postcss(postcssConfig.plugins).process(cssCode, { from })).css;
}

/** @type {(entryPoint: string, options?: InlineBundleOptions) => Promise<string>} */
async function getJs(entryPoint, { cwd = process.cwd() } = {}) {
	const { rolldown } = await loadRolldown();
	const input = path.join('src/client', entryPoint);
	const bundle = await rolldown({ cwd, input });
	const { code } = (await bundle.generate({ format: 'esm', minify: true })).output[0];

	await bundle.close();

	return code;
}

/** @type {(cwd: string) => Promise<{ plugins: import('postcss').AcceptedPlugin[] }>} */
async function loadPostcssConfig(cwd) {
	const hostConfigPath = path.join(cwd, 'postcss.config.js');

	try {
		await access(hostConfigPath);
		const hostConfigUrl = pathToFileURL(hostConfigPath).href;
		const hostConfig = await import(hostConfigUrl);

		return hostConfig.default;
	} catch {
		return postcssBaseConfig;
	}
}

/** Подключает rolldown при первом вызове getJs. */
async function loadRolldown() {
	if (!rolldownLoad) {
		rolldownLoad = import('rolldown');
	}

	return rolldownLoad;
}

export { getCss, getJs };
