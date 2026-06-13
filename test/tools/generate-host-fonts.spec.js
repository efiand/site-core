import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseFontFilename } from '../../tools/generate-host-fonts.js';

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
});
