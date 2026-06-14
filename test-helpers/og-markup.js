import assert from 'node:assert/strict';
import { getHtmlPrefixAttribute, getOgTypeValues, validateOgMarkup } from '#core/common/lib/validate-og-markup.js';

/** @type {(markup: string, fragment: string) => void} */
function assertHtmlPrefixIncludes(markup, fragment) {
	const prefix = getHtmlPrefixAttribute(markup);

	assert.ok(prefix.includes(fragment), `Expected html prefix to include "${fragment}", got: ${prefix || '(empty)'}`);
}

/** @type {(markup: string, expectedType: string) => void} */
function assertSingleOgType(markup, expectedType) {
	const values = getOgTypeValues(markup);

	assert.strictEqual(values.length, 1, `Expected single og:type, got: ${values.join(', ') || '(none)'}`);
	assert.strictEqual(values[0], expectedType);
}

/** @type {(options: { content: string; log?: (...args: unknown[]) => void; name?: string }) => { warningCount: number }} */
function lintOgMarkup({ content, log = () => {}, name = '' }) {
	const report = validateOgMarkup(content);
	const errors = report.issues.filter((issue) => issue.severity === 'error');

	for (const issue of errors) {
		const label = issue.property ? `[${issue.property}] ` : '';
		log(`${name}: ${label}${issue.message}`);
	}

	return { warningCount: errors.length };
}

export { assertHtmlPrefixIncludes, assertSingleOgType, getHtmlPrefixAttribute, getOgTypeValues, lintOgMarkup };
