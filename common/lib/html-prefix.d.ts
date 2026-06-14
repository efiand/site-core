declare const ARTICLE_OGP_PREFIX: string;

declare const DEFAULT_HTML_PREFIX: string;

declare const OGP_NS: string;

declare const OGP_PREFIX_ARTICLE: { ns: string; type: string };

declare const OGP_PREFIX_OG: { ns: string; type: string };

declare function buildHtmlPrefix(prefixes: { ns: string; type: string }[]): string;

export { ARTICLE_OGP_PREFIX, DEFAULT_HTML_PREFIX, OGP_NS, OGP_PREFIX_ARTICLE, OGP_PREFIX_OG, buildHtmlPrefix };
