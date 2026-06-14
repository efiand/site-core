import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	assertHtmlPrefixIncludes,
	assertSingleOgType,
	getHtmlPrefixAttribute,
	getOgTypeValues,
	lintOgMarkup,
} from '#core/test-helpers/og-markup.js';

const sampleHtml = /* html */ `<!DOCTYPE html>
<html lang="ru" prefix="og: http://ogp.me/ns# article: http://ogp.me/ns/article#">
<head>
	<meta property="og:type" content="article">
</head>
<body></body>
</html>`;

const validWebsiteHtml = /* html */ `<!DOCTYPE html>
<html lang="ru" prefix="og: http://ogp.me/ns#">
<head>
	<meta property="og:title" content="Example">
	<meta property="og:type" content="website">
	<meta property="og:locale" content="ru_RU">
	<meta property="og:site_name" content="example.com">
	<meta property="og:image" content="/image.png">
</head>
<body></body>
</html>`;

describe('Хелперы/og-markup', () => {
	test('getHtmlPrefixAttribute читает prefix', () => {
		assert.strictEqual(getHtmlPrefixAttribute(sampleHtml), 'og: http://ogp.me/ns# article: http://ogp.me/ns/article#');
	});

	test('getOgTypeValues возвращает все og:type', () => {
		assert.deepStrictEqual(getOgTypeValues(sampleHtml), ['article']);
	});

	test('assertSingleOgType проходит для одного значения', () => {
		assert.doesNotThrow(() => {
			assertSingleOgType(sampleHtml, 'article');
		});
	});

	test('assertSingleOgType падает при дубликатах', () => {
		const duplicateHtml = `${sampleHtml.replace('</head>', '<meta property="og:type" content="website"></head>')}`;

		assert.throws(() => {
			assertSingleOgType(duplicateHtml, 'article');
		}, /Expected single og:type/);
	});

	test('assertHtmlPrefixIncludes проверяет фрагмент', () => {
		assert.doesNotThrow(() => {
			assertHtmlPrefixIncludes(sampleHtml, 'article: http://ogp.me/ns/article#');
		});
	});

	test('lintOgMarkup возвращает warningCount как posthtml-bem-linter', () => {
		const result = lintOgMarkup({ content: validWebsiteHtml, name: '/' });

		assert.strictEqual(result.warningCount, 0);
	});
});
