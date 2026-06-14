/// <reference path="../../types/index.d.ts" />

import { ARTICLE_OGP_PREFIX, DEFAULT_HTML_PREFIX } from '#core/common/lib/html-prefix.js';

const REQUIRED_OG_PROPERTIES = ['og:image', 'og:locale', 'og:site_name', 'og:title', 'og:type'];

/** @type {(markup: string) => string} */
function getHtmlPrefixAttribute(markup) {
	const match = markup.match(/<html[^>]*\sprefix="([^"]*)"/);

	return match?.[1] ?? '';
}

/** @type {(markup: string) => Map<string, string[]>} */
function getMetaPropertyValues(markup) {
	/** @type {Map<string, string[]>} */
	const properties = new Map();
	const pattern = /<meta property="([^"]+)" content="([^"]*)"/g;

	for (const match of markup.matchAll(pattern)) {
		const [, property, value] = match;
		if (!property) {
			continue;
		}

		const values = properties.get(property) ?? [];
		values.push(value ?? '');
		properties.set(property, values);
	}

	return properties;
}

/** @type {(markup: string) => string[]} */
function getOgTypeValues(markup) {
	return getMetaPropertyValues(markup).get('og:type') ?? [];
}

/** @type {(properties: Map<string, string[]>, property: string, message: string) => OgMarkupIssue} */
function createPropertyIssue(_properties, property, message) {
	return {
		message,
		property,
		severity: 'error',
	};
}

/** @type {(properties: Map<string, string[]>, issues: OgMarkupIssue[]) => void} */
function validateArticleConsistency(properties, issues) {
	const articleProperties = [...properties.keys()].filter((property) => property.startsWith('article:'));
	const ogType = (properties.get('og:type') ?? [])[0] ?? '';

	if (articleProperties.length === 0 && ogType !== 'article') {
		return;
	}

	if (ogType !== 'article') {
		issues.push({
			message: 'article:* meta tags require og:type "article"',
			property: 'og:type',
			severity: 'error',
		});
	}

	if (ogType === 'article' && !properties.has('article:published_time')) {
		issues.push(
			createPropertyIssue(properties, 'article:published_time', 'og:type "article" requires article:published_time'),
		);
	}
}

/** @type {(markup: string, properties: Map<string, string[]>, issues: OgMarkupIssue[]) => void} */
function validatePrefixConsistency(markup, properties, issues) {
	const prefix = getHtmlPrefixAttribute(markup);
	const articleProperties = [...properties.keys()].filter((property) => property.startsWith('article:'));
	const ogType = (properties.get('og:type') ?? [])[0] ?? '';

	if (!prefix.includes('og: http://ogp.me/ns#')) {
		issues.push({
			message: 'html prefix must declare og namespace',
			severity: 'error',
		});
	}

	if ((ogType === 'article' || articleProperties.length > 0) && !prefix.includes(ARTICLE_OGP_PREFIX)) {
		issues.push({
			message: `html prefix must include "${ARTICLE_OGP_PREFIX}" when article Open Graph tags are used`,
			severity: 'error',
		});
	}

	if (ogType === 'website' && prefix !== DEFAULT_HTML_PREFIX && articleProperties.length === 0) {
		issues.push({
			message: `website pages should use default og prefix "${DEFAULT_HTML_PREFIX}"`,
			severity: 'error',
		});
	}
}

/** @type {(properties: Map<string, string[]>, issues: OgMarkupIssue[]) => void} */
function validateRequiredProperties(properties, issues) {
	for (const property of REQUIRED_OG_PROPERTIES) {
		const values = properties.get(property) ?? [];

		if (values.length === 0) {
			issues.push(createPropertyIssue(properties, property, `Missing ${property}`));
			continue;
		}

		if (values.length > 1) {
			issues.push(createPropertyIssue(properties, property, `Duplicate ${property}`));
		}

		if (values.some((value) => !value.trim())) {
			issues.push(createPropertyIssue(properties, property, `Empty ${property}`));
		}
	}
}

/** @type {(properties: Map<string, string[]>, issues: OgMarkupIssue[]) => void} */
function validateUniqueOgProperties(properties, issues) {
	for (const [property, values] of properties) {
		if (!property.startsWith('og:') || values.length <= 1) {
			continue;
		}

		if (REQUIRED_OG_PROPERTIES.includes(property)) {
			continue;
		}

		issues.push(createPropertyIssue(properties, property, `Duplicate ${property}`));
	}
}

/** @type {(properties: Map<string, string[]>, issues: OgMarkupIssue[]) => void} */
function validateWebsiteConsistency(properties, issues) {
	const ogType = (properties.get('og:type') ?? [])[0] ?? '';
	const articleProperties = [...properties.keys()].filter((property) => property.startsWith('article:'));

	if (ogType === 'website' && articleProperties.length > 0) {
		issues.push({
			message: 'og:type "website" must not include article:* meta tags',
			property: 'og:type',
			severity: 'error',
		});
	}
}

/** @type {(markup: string) => OgMarkupReport} */
function validateOgMarkup(markup) {
	/** @type {OgMarkupIssue[]} */
	const issues = [];
	const properties = getMetaPropertyValues(markup);

	validateRequiredProperties(properties, issues);
	validateUniqueOgProperties(properties, issues);
	validateWebsiteConsistency(properties, issues);
	validateArticleConsistency(properties, issues);
	validatePrefixConsistency(markup, properties, issues);

	const errorCount = issues.filter((issue) => issue.severity === 'error').length;

	return {
		issues,
		valid: errorCount === 0,
	};
}

export { getHtmlPrefixAttribute, getMetaPropertyValues, getOgTypeValues, validateOgMarkup };
