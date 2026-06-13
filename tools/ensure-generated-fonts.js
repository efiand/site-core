#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { resolveCoreRoot, writeFontsRegistry } from './generate-host-fonts.js';

/** @type {(hostRoot: string) => boolean} */
function hasHostFontFiles(hostRoot) {
	const fontsDir = path.join(hostRoot, 'public', 'fonts');

	if (!fs.existsSync(fontsDir)) {
		return false;
	}

	return fs.readdirSync(fontsDir).some((filename) => filename.toLowerCase().endsWith('.woff2'));
}

const hostRoot = process.cwd();
const jsPath = path.join(resolveCoreRoot(hostRoot), 'common', 'generated', 'fonts.js');

if (!hasHostFontFiles(hostRoot)) {
	writeFontsRegistry(jsPath, []);
}
