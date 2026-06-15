#!/usr/bin/env node
import path from 'node:path';
import { hasHostFontFiles, resolveCoreRoot, writeFontsRegistry } from './generate-host-fonts.js';

const hostRoot = process.cwd();
const jsPath = path.join(resolveCoreRoot(hostRoot), 'common', 'generated', 'fonts.js');

if (!hasHostFontFiles(hostRoot)) {
	writeFontsRegistry(jsPath, []);
}
