import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { SyntaxValidator } from 'fast-xml-validator';
import { log } from '#core/common/lib/log.js';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { createSitemapXmlRoute, renderSitemap, renderSitemapUrl } from '#core/common/templates/sitemap-xml.js';
import { createRouteParams } from '#core/test-helpers/route-params.js';

describe('Общее/sitemap-xml', () => {
	test('createSitemapXmlRoute возвращает валидный xml sitemap', async () => {
		setSiteConfig({
			baseHost: 'example.com',
			privacyRevisionDate: '2026-06-09',
			pubDate: '2026-06-01',
			publicPages: ['/', '/privacy', '/order'],
			routes: { '/': {}, '/order': {}, '/privacy': {} },
		});

		const { contentType, template } = await createSitemapXmlRoute().GET(createRouteParams());
		const xml = (template ?? '').trim();
		const result = SyntaxValidator.validate(xml);
		const isValid = result === true;

		if (!isValid) {
			const { col, line, msg } = result.err;
			log.error(`sitemap.xml [${line}:${col}] ${msg}`);
		}

		assert.strictEqual(contentType, 'application/xml');
		assert.strictEqual(isValid, true);
		assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8" \?>/);
		assert.match(xml, /<urlset xmlns="https:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
		assert.match(xml, /<loc>https:\/\/example\.com\/<\/loc>/);
		assert.match(xml, /<loc>https:\/\/example\.com\/order<\/loc>/);
		assert.match(xml, /<loc>https:\/\/example\.com\/privacy<\/loc>[\s\S]*?<lastmod>2026-06-09<\/lastmod>/);
		assert.match(xml, /<loc>https:\/\/example\.com\/<\/loc>[\s\S]*?<lastmod>2026-06-01<\/lastmod>/);
		assert.match(xml, /<loc>https:\/\/example\.com\/order<\/loc>[\s\S]*?<lastmod>2026-06-01<\/lastmod>/);
		assert.strictEqual(xml.match(/<url>/g)?.length, 3);
	});

	test('createSitemapXmlRoute принимает pages и resolver', async () => {
		setSiteConfig({ baseHost: 'example.com' });

		const fromPages = await createSitemapXmlRoute(['/order']).GET(createRouteParams());
		const fromResolver = await createSitemapXmlRoute(() => ['/portfolio']).GET(createRouteParams());

		assert.match(fromPages.template ?? '', /<loc>https:\/\/example\.com\/order<\/loc>/);
		assert.strictEqual((fromPages.template ?? '').match(/<url>/g)?.length, 1);
		assert.match(fromResolver.template ?? '', /<loc>https:\/\/example\.com\/portfolio<\/loc>/);
		assert.strictEqual((fromResolver.template ?? '').match(/<url>/g)?.length, 1);
	});

	test('renderSitemapUrl рендерит loc и priority', () => {
		const markup = renderSitemapUrl({ loc: 'https://example.com/order', priority: '0.8' });

		assert.match(markup, /<loc>https:\/\/example\.com\/order<\/loc>/);
		assert.match(markup, /<priority>0\.8<\/priority>/);
		assert.doesNotMatch(markup, /<lastmod>/);
	});

	test('renderSitemapUrl рендерит loc и lastmod', () => {
		const markup = renderSitemapUrl({ lastmod: '2026-06-09T00:00:00.000Z', loc: 'https://example.com/' });

		assert.match(markup, /<loc>https:\/\/example\.com\/<\/loc>/);
		assert.match(markup, /<lastmod>2026-06-09T00:00:00\.000Z<\/lastmod>/);
		assert.doesNotMatch(markup, /<priority>/);
	});

	test('renderSitemap собирает urlset из SitemapPage[]', () => {
		const markup = renderSitemap([
			{ loc: 'https://example.com/', priority: '0.8' },
			{ lastmod: '2026-06-09', loc: 'https://example.com/privacy' },
		]);

		assert.match(markup, /^<\?xml version="1.0" encoding="UTF-8" \?>/);
		assert.match(markup, /<urlset xmlns="https:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
		assert.match(markup, /<loc>https:\/\/example\.com\/<\/loc>/);
		assert.match(markup, /<loc>https:\/\/example\.com\/privacy<\/loc>/);
		assert.strictEqual(markup.match(/<url>/g)?.length, 2);
	});

	test('renderSitemap по умолчанию берёт publicPages из конфига', () => {
		setSiteConfig({
			baseHost: 'example.com',
			privacyRevisionDate: '2026-06-09',
			pubDate: '2026-06-01',
			publicPages: ['/', '/privacy'],
			routes: { '/': {}, '/privacy': {} },
		});

		const markup = renderSitemap();

		assert.match(markup, /<loc>https:\/\/example\.com\/<\/loc>[\s\S]*?<lastmod>2026-06-01<\/lastmod>/);
		assert.match(markup, /<loc>https:\/\/example\.com\/privacy<\/loc>[\s\S]*?<lastmod>2026-06-09<\/lastmod>/);
		assert.strictEqual(markup.match(/<url>/g)?.length, 2);
	});

	test('renderSitemap для /privacy без privacyRevisionDate не рендерит lastmod', () => {
		setSiteConfig({
			baseHost: 'example.com',
			privacyRevisionDate: '',
			pubDate: '2026-06-01',
			publicPages: ['/', '/privacy'],
			routes: { '/': {}, '/privacy': {} },
		});

		const markup = renderSitemap();

		assert.match(markup, /<loc>https:\/\/example\.com\/privacy<\/loc>/);
		assert.doesNotMatch(markup, /<loc>https:\/\/example\.com\/privacy<\/loc>[\s\S]*?<lastmod>/);
	});

	test('renderSitemap сохраняет явный lastmod для /privacy', () => {
		setSiteConfig({
			baseHost: 'example.com',
			privacyRevisionDate: '2026-06-09',
		});

		const markup = renderSitemap([{ lastmod: '2026-05-01', loc: 'https://example.com/privacy' }]);

		assert.match(markup, /<lastmod>2026-05-01<\/lastmod>/);
		assert.doesNotMatch(markup, /<lastmod>2026-06-09<\/lastmod>/);
	});

	test('renderSitemap нормализует privacyRevisionDate для /privacy', () => {
		setSiteConfig({
			baseHost: 'example.com',
			privacyRevisionDate: '2026-06-09 14:30:00',
			publicPages: ['/privacy'],
			routes: { '/privacy': {} },
		});

		const markup = renderSitemap();

		assert.match(markup, /<lastmod>2026-06-09T14:30:00<\/lastmod>/);
	});

	test('renderSitemap из путей строит loc и lastmod из конфига', () => {
		setSiteConfig({
			baseHost: 'example.com',
			pubDate: '2026-06-09T00:00:00.000Z',
		});

		const markup = renderSitemap(['/', '/order']);

		assert.match(markup, /<loc>https:\/\/example\.com\/<\/loc>/);
		assert.match(markup, /<loc>https:\/\/example\.com\/order<\/loc>/);
		assert.match(markup, /<lastmod>2026-06-09T00:00:00\.000Z<\/lastmod>/);
		assert.strictEqual(markup.match(/<url>/g)?.length, 2);
	});
});
