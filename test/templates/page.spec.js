import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { DEFAULT_HTML_PREFIX } from '#core/common/lib/html-prefix.js';
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
		setSiteConfig({ author: '', pubDate: '', yandexMetrikaId: 0 });
	});

	test('createRenderPage оборачивает renderLayout в body с cookie-баннером', async () => {
		const renderPage = createRenderPage({
			renderLayout: ({ pageTemplate }) => /* html */ `<main>${pageTemplate}</main>`,
		});

		const html = await renderPage({ pageTemplate: 'content', pathname: '/' });

		assert.match(html, /<body>/);
		assert.match(html, /class="cookie-consent"/);
		assert.match(html, /<main>content<\/main>/);
		assert.doesNotMatch(html, /<body>[\s\S]*<body>/);
		assert.doesNotMatch(html, /Yandex\.Metrika/);
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

	test('createRenderPage поддерживает ogType без дубликатов', async () => {
		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			ogType: 'article',
			pageTemplate: '',
			pathname: '/mad/1',
		});

		assert.match(html, /<meta property="og:type" content="article">/);
		assert.doesNotMatch(html, /<meta property="og:type" content="website">/);
	});

	test('createRenderPage пропускает url meta на служебных страницах', async () => {
		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			heading: 'Ошибка 404',
			pageTemplate: '',
			pathname: '/__/404',
		});

		assert.doesNotMatch(html, /property="og:url"/);
		assert.doesNotMatch(html, /rel="canonical"/);
	});

	test('createRenderPage пропускает cookie-баннер и client entry на служебных страницах', async () => {
		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			heading: 'Ошибка 404',
			pageTemplate: '',
			pathname: '/__/404',
		});

		assert.doesNotMatch(html, /class="cookie-consent"/);
		assert.doesNotMatch(html, /\/bundles\/main\.js/);
	});

	test('createRenderPage пропускает cookie-баннер при excludePathnamePrefixes по ogPathname', async () => {
		setSiteConfig({
			cookieConsent: { excludePathnamePrefixes: ['/manuscript'] },
			yandexMetrikaId: 102299682,
		});

		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			heading: 'Глава',
			ogPathname: '/manuscript/mad/1',
			pageTemplate: '',
			pathname: '/mad/1',
		});

		assert.doesNotMatch(html, /class="cookie-consent"/);
	});

	test('createRenderPage на главной рендерит document, title, og:url и canonical', async () => {
		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			description: 'Описание сайта.',
			heading: 'Автор',
			pageTemplate: '',
			pathname: '/',
		});

		assert.match(html, /<!DOCTYPE html>/);
		assert.match(html, /<html lang="ru"/);
		assert.match(html, /<title>example<\/title>/);
		assert.match(html, /<meta name="description" content="Описание сайта\.">/);
		assert.match(html, /property="og:url" content="https:\/\/example\.com\/"/);
		assert.match(html, /rel="canonical" href="https:\/\/example\.com\/"/);
		assert.match(html, /\/bundles\/main\.css/);
	});

	test('createRenderPage поддерживает webAppTitle и getHtmlPrefix', async () => {
		const renderPage = createRenderPage({
			getHtmlPrefix: ({ pathname = '' }) =>
				pathname.startsWith('/mad') ? 'og: http://ogp.me/ns# article: http://ogp.me/ns/article#' : DEFAULT_HTML_PREFIX,
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

	test('createRenderPage рендерит name="author" при непустом author в конфиге', async () => {
		setSiteConfig({ author: 'Автор' });

		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			pageTemplate: '',
			pathname: '/',
		});

		assert.match(html, /<meta name="author" content="Автор">/);
		assert.doesNotMatch(html, /property="article:author"/);
	});

	test('createRenderPage рендерит article:* для ogType article с publishedTime', async () => {
		setSiteConfig({ author: 'Автор' });

		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			ogType: 'article',
			pageTemplate: '',
			pathname: '/mad/1',
			publishedTime: '2026-06-14T12:00:00.000Z',
		});

		assert.match(html, /<meta name="author" content="Автор">/);
		assert.match(html, /property="article:author" content="https:\/\/example\.com\/#author"/);
		assert.match(html, /property="article:published_time" content="2026-06-14T12:00:00.000Z"/);
		assert.match(html, /article: http:\/\/ogp\.me\/ns\/article#/);
	});

	test('createRenderPage использует publishedTime из LayoutData хоста', async () => {
		setSiteConfig({ author: 'Автор' });

		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			articleWork: {
				bookId: 'mad',
				bookTitle: 'Стихотворения',
				copyrightYear: '2003',
				createdTime: '2003-04-19',
			},
			ogType: 'article',
			pageTemplate: '',
			pathname: '/mad/1',
			publishedTime: '2026-05-01T12:00:00.000Z',
			title: 'Прекрасная пора',
		});

		assert.match(html, /property="article:published_time" content="2026-05-01T12:00:00.000Z"/);
		assert.match(html, /"datePublished":"2026-05-01T12:00:00.000Z"/);
	});

	test('createRenderPage без publishedTime не рендерит article:published_time', async () => {
		setSiteConfig({ author: 'Автор' });

		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			ogType: 'article',
			pageTemplate: '',
			pathname: '/mad/1',
		});

		assert.doesNotMatch(html, /property="article:published_time"/);
	});

	test('createRenderPage поддерживает LayoutData.author поверх конфига', async () => {
		setSiteConfig({ author: 'Автор' });

		const renderPage = createRenderPage({
			renderLayout: () => '',
		});

		const html = await renderPage({
			author: 'Соавтор',
			pageTemplate: '',
			pathname: '/',
		});

		assert.match(html, /<meta name="author" content="Соавтор">/);
	});
});
