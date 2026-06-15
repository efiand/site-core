import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { generateHostFonts, hasHostFontFiles, parseFontFilename } from '../../tools/generate-host-fonts.js';

describe('Инструменты/generate-host-fonts', () => {
	test('parseFontFilename сохраняет канонические имена', () => {
		assert.deepEqual(parseFontFilename('manrope-400.woff2'), {
			canonicalName: 'manrope-400.woff2',
			familyName: 'Manrope',
			italic: false,
			weight: 400,
		});
	});

	test('parseFontFilename нормализует именованные веса', () => {
		assert.deepEqual(parseFontFilename('NotoSans-Regular.woff2'), {
			canonicalName: 'notosans-400.woff2',
			familyName: 'Notosans',
			italic: false,
			weight: 400,
		});
	});

	test('parseFontFilename поддерживает суффикс italic', () => {
		assert.deepEqual(parseFontFilename('manrope-500-italic.woff2'), {
			canonicalName: 'manrope-500-italic.woff2',
			familyName: 'Manrope',
			italic: true,
			weight: 500,
		});
	});

	test('parseFontFilename поддерживает многочастные slug семейства', () => {
		assert.deepEqual(parseFontFilename('noto-sans-600.woff2'), {
			canonicalName: 'noto-sans-600.woff2',
			familyName: 'Noto Sans',
			italic: false,
			weight: 600,
		});
	});

	describe('generateHostFonts', () => {
		/** @type {string} */
		let hostRoot;

		after(() => {
			if (hostRoot) {
				fs.rmSync(hostRoot, { force: true, recursive: true });
			}
		});

		test('Без public/fonts не создаёт fonts.css и пустой каталог fonts', () => {
			hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-fonts-'));
			const cssPath = path.join(hostRoot, 'src', 'client', 'css', 'common', 'fonts.css');
			const fontsDir = path.join(hostRoot, 'public', 'fonts');

			assert.equal(hasHostFontFiles(hostRoot), false);

			const result = generateHostFonts(hostRoot);

			assert.deepEqual(result.fonts, []);
			assert.equal(fs.existsSync(cssPath), false);
			assert.equal(fs.existsSync(fontsDir), false);
		});

		test('Удаляет устаревший fonts.css, если .woff2 в каталоге нет', () => {
			hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'site-core-fonts-'));
			const cssPath = path.join(hostRoot, 'src', 'client', 'css', 'common', 'fonts.css');

			fs.mkdirSync(path.dirname(cssPath), { recursive: true });
			fs.writeFileSync(cssPath, '@font-face {}', 'utf8');
			fs.mkdirSync(path.join(hostRoot, 'public', 'fonts'), { recursive: true });

			generateHostFonts(hostRoot);

			assert.equal(fs.existsSync(cssPath), false);
		});
	});
});
