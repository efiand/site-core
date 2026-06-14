/// <reference path="../../types/index.d.ts" />

declare function createSitemapXmlRoute(pages?: SitemapPagesResolver): { GET: RouteMethod };

declare function renderSitemap(pages?: SitemapPagesInput): string;

declare function renderSitemapUrl(page: SitemapPage): string;

export { createSitemapXmlRoute, renderSitemap, renderSitemapUrl };
