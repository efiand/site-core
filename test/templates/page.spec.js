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
			pathname: '/',
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
});
