#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/** @type {Record<string, number>} */
const WEIGHT_NAMES = {
	black: 900,
	bold: 700,
	book: 400,
	demibold: 600,
	extrabold: 800,
	extralight: 200,
	hairline: 100,
	heavy: 900,
	light: 300,
	medium: 500,
	normal: 400,
	regular: 400,
	semibold: 600,
	thin: 100,
	ultrabold: 800,
	ultralight: 200,
};

const CANONICAL_STEM_REGEX = /^(.+)-(\d{3})(-italic)?$/;

/** @type {(hostRoot: string) => { cssPath: string; fonts: string[]; jsPath: string }} */
function generateHostFonts(hostRoot) {
	const coreRoot = resolveCoreRoot(hostRoot);
	const fontsDir = path.join(hostRoot, 'public', 'fonts');
	const cssPath = path.join(hostRoot, 'src', 'client', 'css', 'common', 'fonts.css');
	const jsPath = path.join(coreRoot, 'common', 'generated', 'fonts.js');

	if (!hasHostFontFiles(hostRoot)) {
		removeStaleFontsCss(cssPath);
		writeFontsRegistry(jsPath, []);

		console.info('Skipped host fonts.css (no .woff2 in public/fonts)');
		console.info(`Generated ${path.relative(coreRoot, jsPath)}`);

		return { cssPath, fonts: [], jsPath };
	}

	if (!fs.existsSync(fontsDir)) {
		fs.mkdirSync(fontsDir, { recursive: true });
	}

	/** @type {Map<string, { canonicalName: string; familyName: string; italic: boolean; weight: number }>} */
	const fontsByCanonical = new Map();

	for (const entry of fs.readdirSync(fontsDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.woff2')) {
			continue;
		}

		const parsed = parseFontFilename(entry.name);
		if (!parsed) {
			console.warn(`site-core-postinstall: skip unrecognized font ${entry.name}`);
			continue;
		}

		const sourcePath = path.join(fontsDir, entry.name);
		const targetPath = path.join(fontsDir, parsed.canonicalName);

		if (sourcePath !== targetPath) {
			if (fs.existsSync(targetPath)) {
				fs.rmSync(targetPath);
			}
			fs.renameSync(sourcePath, targetPath);
			console.info(`Renamed ${entry.name} → ${parsed.canonicalName}`);
		}

		fontsByCanonical.set(parsed.canonicalName, { ...parsed, canonicalName: parsed.canonicalName });
	}

	const fonts = [...fontsByCanonical.keys()].sort();
	const css = [...fontsByCanonical.values()]
		.sort((left, right) => left.canonicalName.localeCompare(right.canonicalName))
		.map(renderFontFace)
		.join('\n');

	fs.mkdirSync(path.dirname(cssPath), { recursive: true });
	fs.writeFileSync(cssPath, css, 'utf8');

	writeFontsRegistry(jsPath, fonts);

	console.info(`Generated ${path.relative(hostRoot, cssPath)} (${fonts.length} @font-face)`);
	console.info(`Generated ${path.relative(coreRoot, jsPath)}`);

	return { cssPath, fonts, jsPath };
}

/** @type {(hostRoot: string) => boolean} */
function hasHostFontFiles(hostRoot) {
	const fontsDir = path.join(hostRoot, 'public', 'fonts');

	if (!fs.existsSync(fontsDir)) {
		return false;
	}

	return fs.readdirSync(fontsDir).some((filename) => filename.toLowerCase().endsWith('.woff2'));
}

/** @type {(filename: string) => { canonicalName: string; familyName: string; italic: boolean; weight: number } | null} */
function parseFontFilename(filename) {
	const stem = filename.replace(/\.woff2$/i, '');
	const parsed = parseFontStem(stem);

	if (!parsed) {
		return null;
	}

	const suffix = parsed.italic ? '-italic' : '';
	const canonicalName = `${parsed.familySlug}-${parsed.weight}${suffix}.woff2`;

	return {
		canonicalName,
		familyName: slugToFamilyName(parsed.familySlug),
		italic: parsed.italic,
		weight: parsed.weight,
	};
}

/** @type {(stem: string) => { familySlug: string; italic: boolean; weight: number } | null} */
function parseFontStem(stem) {
	const canonical = stem.match(CANONICAL_STEM_REGEX);
	if (canonical) {
		return {
			familySlug: canonical[1],
			italic: Boolean(canonical[3]),
			weight: Number(canonical[2]),
		};
	}

	let italic = false;
	let base = stem.toLowerCase();

	if (base.endsWith('-italic')) {
		italic = true;
		base = base.slice(0, -'-italic'.length);
	} else if (base.endsWith('italic')) {
		italic = true;
		base = base.replace(/-?italic$/, '');
	}

	const numericMatch = base.match(/^(.+)-(\d{1,3})$/);
	if (numericMatch) {
		return {
			familySlug: numericMatch[1],
			italic,
			weight: Number(numericMatch[2]),
		};
	}

	const parts = base.split('-').filter(Boolean);
	if (parts.length >= 2) {
		const weightPart = parts.at(-1)?.replace(/[^a-z]/g, '') ?? '';
		const weight = WEIGHT_NAMES[weightPart];

		if (weight !== undefined) {
			return {
				familySlug: parts.slice(0, -1).join('-'),
				italic,
				weight,
			};
		}
	}

	const camelMatch = base.match(
		/^([a-z0-9]+?)(italic|regular|normal|medium|bold|thin|light|black|heavy|semibold|extrabold)$/,
	);
	if (camelMatch) {
		const weight = WEIGHT_NAMES[camelMatch[2].replace(/[^a-z]/g, '')];
		if (weight !== undefined) {
			return {
				familySlug: camelMatch[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
				italic: camelMatch[2].includes('italic') || italic,
				weight,
			};
		}
	}

	return null;
}

/** @type {(cssPath: string) => void} */
function removeStaleFontsCss(cssPath) {
	if (fs.existsSync(cssPath)) {
		fs.rmSync(cssPath);
	}
}

/** @type {(font: { canonicalName: string; familyName: string; italic: boolean; weight: number }) => string} */
function renderFontFace({ canonicalName, familyName, italic, weight }) {
	return `@font-face {
	font-weight: ${weight};
	font-style: ${italic ? 'italic' : 'normal'};
	font-family: "${familyName}";
	font-display: swap;
	src: url("/fonts/${canonicalName}") format("woff2");
}
`;
}

/** @type {(hostRoot: string) => string} */
function resolveCoreRoot(hostRoot) {
	const linkedCore = path.join(hostRoot, 'node_modules', 'site-core');

	if (fs.existsSync(linkedCore)) {
		return fs.realpathSync(linkedCore);
	}

	return hostRoot;
}

/** @type {(slug: string) => string} */
function slugToFamilyName(slug) {
	return slug
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

/** @type {(jsPath: string, fonts: string[]) => void} */
function writeFontsRegistry(jsPath, fonts) {
	fs.mkdirSync(path.dirname(jsPath), { recursive: true });

	const fontsExport = fonts.length ? `[\n${fonts.map((filename) => `\t'${filename}'`).join(',\n')},\n]` : '[]';

	const js = `/** @type {readonly string[]} */
export const fonts = ${fontsExport};
`;

	fs.writeFileSync(jsPath, js, 'utf8');
}

export {
	generateHostFonts,
	hasHostFontFiles,
	parseFontFilename,
	removeStaleFontsCss,
	resolveCoreRoot,
	writeFontsRegistry,
};
