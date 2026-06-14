import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	DEFAULT_HTML_PREFIX,
	OGP_PREFIX_ARTICLE,
	OGP_PREFIX_OG,
	buildHtmlPrefix,
} from '#core/common/lib/html-prefix.js';

describe('Общее/html-prefix', () => {
	test('buildHtmlPrefix собирает og namespace', () => {
		assert.strictEqual(buildHtmlPrefix([OGP_PREFIX_OG]), 'og: http://ogp.me/ns#');
	});

	test('DEFAULT_HTML_PREFIX — только og', () => {
		assert.strictEqual(DEFAULT_HTML_PREFIX, 'og: http://ogp.me/ns#');
	});

	test('buildHtmlPrefix добавляет article namespace', () => {
		assert.strictEqual(
			buildHtmlPrefix([OGP_PREFIX_OG, OGP_PREFIX_ARTICLE]),
			'og: http://ogp.me/ns# article: http://ogp.me/ns/article#',
		);
	});
});
