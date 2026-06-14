const OGP_NS = 'http://ogp.me/ns';

const OGP_PREFIX_ARTICLE = { ns: '/article', type: 'article' };

const OGP_PREFIX_OG = { ns: '', type: 'og' };

/** @type {(prefixes: { ns: string; type: string }[]) => string} */
function buildHtmlPrefix(prefixes) {
	return prefixes.map(({ ns, type }) => `${type}: ${OGP_NS}${ns}#`).join(' ');
}

const DEFAULT_HTML_PREFIX = buildHtmlPrefix([OGP_PREFIX_OG]);

const ARTICLE_OGP_PREFIX = `${OGP_PREFIX_ARTICLE.type}: ${OGP_NS}${OGP_PREFIX_ARTICLE.ns}#`;

export { ARTICLE_OGP_PREFIX, DEFAULT_HTML_PREFIX, OGP_NS, OGP_PREFIX_ARTICLE, OGP_PREFIX_OG, buildHtmlPrefix };
