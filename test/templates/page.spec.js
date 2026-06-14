import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { createRenderPage } from '#core/common/templates/page.js';

describe('Общее/Страница', () => {
	beforeEach(() => {
		setSiteConfig({
			baseHost: 'example.com',
			projectDescription: 'Example description.',
			projectTitle: 'example',
			version: { CSS: 1, JS: 1 },
			yandexMetrikaId: 102299682,
		});
	});

	afterEach(() => {
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('createRenderPage оборачивает renderLayout в body с метрикой', async () => {
		const renderPage = createRenderPage({
			renderLayout: ({ pageTemplate }) => /* html */ `<main>${pageTemplate}</main>`,
		});

		const html = await renderPage({ pageTemplate: 'content', pathname: '/' });

		assert.match(html, /<body>/);
		assert.match(html, /Yandex\.Metrika/);
		assert.match(html, /<main>content<\/main>/);
		assert.doesNotMatch(html, /<body>[\s\S]*<body>/);
	});

	test('createRenderPage по умолчанию подключает сгенерированные шрифты', async () => {
		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({ pageTemplate: '', pathname: '/' });

		assert.doesNotMatch(html, /rel="preload" as="font"/);
	});

	test('createRenderPage рендерит og-теги и prod-ассеты', async () => {
		const renderPage = createRenderPage({
			fonts: ['example-400.woff2'],
			renderLayout: () => '',
		});

		const html = await renderPage({
			heading: 'Hello',
			pageTemplate: '',
			pathname: '/about',
		});

		assert.match(html, /<title>Hello \| example<\/title>/);
		assert.match(html, /property="og:site_name" content="example.com"/);
		assert.match(html, /\/bundles\/main\.css/);
		assert.match(html, /href="\/fonts\/example-400\.woff2"/);
		assert.match(html, /href="\/favicon\.svg"/);
	});

	test('createRenderPage берёт faviconPrefix из вызова renderPage', async () => {
		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			faviconPrefix: '/manuscript',
			pageTemplate: '',
			pathname: '/',
		});

		assert.match(html, /href="\/manuscript\/favicon\.svg"/);
	});

	test('createRenderPage собирает document title из title и heading', async () => {
		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			heading: 'Стихотворения',
			pageTemplate: '',
			pathname: '/mad/1',
			title: 'Прекрасная пора',
		});

		assert.match(html, /<title>Прекрасная пора \| Стихотворения \| example<\/title>/);
	});

	test('createRenderPage поддерживает getPageAssetsOptions и ogPathname', async () => {
		const renderPage = createRenderPage({
			getPageAssetsOptions: ({ faviconPrefix = '' }) => ({
				cssEntry: faviconPrefix ? 'manuscript' : 'main',
				devCssPath: faviconPrefix ? '/client/css/manuscript.css' : '/client/css/main.css',
			}),
			renderLayout: () => '',
		});

		const html = await renderPage({
			faviconPrefix: '/manuscript',
			ogPathname: '/manuscript/mad/1',
			pageTemplate: '',
			pathname: '/mad/1',
		});

		assert.match(html, /manuscript\.css/);
		assert.match(html, /property="og:url" content="https:\/\/example.com\/manuscript\/mad\/1"/);
		assert.match(html, /rel="canonical" href="https:\/\/example.com\/mad\/1"/);
	});

	test('createRenderPage поддерживает webAppTitle и getHtmlPrefix', async () => {
		const renderPage = createRenderPage({
			getHtmlPrefix: ({ pathname = '' }) =>
				pathname.startsWith('/mad')
					? 'og: http://ogp.me/ns# article: http://ogp.me/ns/article#'
					: 'og: http://ogp.me/ns#',
			renderLayout: () => '',
		});

		const html = await renderPage({
			pageTemplate: '',
			pathname: '/mad/1',
			webAppTitle: 'Рукопись',
		});

		assert.match(html, /apple-mobile-web-app-title" content="Рукопись"/);
		assert.match(html, /article: http:\/\/ogp\.me\/ns\/article#/);
	});
});
