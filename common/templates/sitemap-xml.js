/// <reference path="../../types/index.d.ts" />

import { normalizeDatetime } from '#core/common/lib/normalize-datetime.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';

const PRIVACY_PAGE_SUFFIX = '/privacy';

/** @type {(page: SitemapPage) => SitemapPage} */
function applyDefaultLastmod(page) {
	if (page.lastmod) {
		return page;
	}

	const { privacyRevisionDate, pubDate } = getSiteConfig();

	if (isPrivacyLoc(page.loc)) {
		const lastmod = privacyRevisionDate ? normalizeDatetime(privacyRevisionDate) : '';

		return lastmod ? { ...page, lastmod } : page;
	}

	return pubDate ? { ...page, lastmod: pubDate } : page;
}

/** @type {(pages?: SitemapPagesResolver) => { GET: RouteMethod }} */
function createSitemapXmlRoute(pages) {
	return {
		async GET() {
			const resolvedPages = typeof pages === 'function' ? await pages() : pages;

			return {
				contentType: 'application/xml',
				template: renderSitemap(resolvedPages),
			};
		},
	};
}

/** @type {(loc: string) => boolean} */
function isPrivacyLoc(loc) {
	return loc.endsWith(PRIVACY_PAGE_SUFFIX);
}

/** @type {(pages?: SitemapPagesInput) => SitemapPage[]} */
function normalizeSitemapPages(pages) {
	const items = pages === undefined ? [...getSiteConfig().publicPages] : [...pages];

	if (!items.length) {
		return [];
	}

	if (typeof items[0] === 'string') {
		const { baseUrl } = getSiteConfig();

		return items.map((page) => applyDefaultLastmod({ loc: `${baseUrl}${page}` }));
	}

	return /** @type {SitemapPage[]} */ (items).map(applyDefaultLastmod);
}

/** @type {(pages?: SitemapPagesInput) => string} */
function renderSitemap(pages) {
	const normalizedPages = normalizeSitemapPages(pages);

	return /* xml */ `<?xml version="1.0" encoding="UTF-8" ?>
		<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
			${normalizedPages.map(renderSitemapUrl).join('')}
		</urlset>`;
}

/** @type {(page: SitemapPage) => string} */
function renderSitemapUrl({ lastmod, loc, priority }) {
	return /* xml */ `
		<url>
			<loc>${loc}</loc>
			${lastmod ? /* xml */ `<lastmod>${lastmod}</lastmod>` : ''}
			${priority ? /* xml */ `<priority>${priority}</priority>` : ''}
		</url>
	`;
}

export { createSitemapXmlRoute, renderSitemap, renderSitemapUrl };
