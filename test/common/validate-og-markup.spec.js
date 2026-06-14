import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { validateOgMarkup } from '#core/common/lib/validate-og-markup.js';

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

describe('Общее/validate-og-markup', () => {
	test('validateOgMarkup принимает базовую website-разметку', () => {
		assert.strictEqual(validateOgMarkup(validWebsiteHtml).valid, true);
	});

	test('validateOgMarkup ловит отсутствие og:title', () => {
		const report = validateOgMarkup(`<html prefix="og: http://ogp.me/ns#"><head>
			<meta property="og:type" content="website">
			<meta property="og:locale" content="ru_RU">
			<meta property="og:site_name" content="example.com">
			<meta property="og:image" content="/image.png">
		</head></html>`);

		assert.strictEqual(report.valid, false);
		assert.ok(report.issues.some((issue) => issue.property === 'og:title'));
	});

	test('validateOgMarkup ловит дубликат og:type', () => {
		const report = validateOgMarkup(
			`${validWebsiteHtml.replace('</head>', '<meta property="og:type" content="website"></head>')}`,
		);

		assert.strictEqual(report.valid, false);
		assert.ok(report.issues.some((issue) => issue.property === 'og:type'));
	});

	test('validateOgMarkup требует article namespace для article:*', () => {
		const report = validateOgMarkup(`<html prefix="og: http://ogp.me/ns#"><head>
			<meta property="og:title" content="Title">
			<meta property="og:type" content="article">
			<meta property="og:locale" content="ru_RU">
			<meta property="og:site_name" content="example.com">
			<meta property="og:image" content="/image.png">
			<meta property="article:published_time" content="2026-06-14">
		</head></html>`);

		assert.strictEqual(report.valid, false);
		assert.ok(report.issues.some((issue) => issue.message.includes('html prefix must include')));
	});
});
