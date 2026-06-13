import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';
import { getSiteConfig, setSiteConfig } from '#core/common/lib/site-config.js';

describe('Общее/site-config/Страницы', () => {
	afterEach(() => {
		delete process.env.DEV;
		delete process.env.DEV_PORT;
		delete process.env.PORT;
		delete process.env.PREVIEW;
		setSiteConfig({ baseHost: '', hasDb: false, publicPages: [], routes: {} });
	});

	test('Берёт PORT из env и формирует host', () => {
		process.env.PORT = '5100';
		setSiteConfig({ routes: {} });

		const { host, port } = getSiteConfig();
		assert.equal(port, 5100);
		assert.equal(host, 'http://localhost:5100');
	});

	test('В dev берёт DEV_PORT', () => {
		process.env.DEV = '1';
		process.env.DEV_PORT = '3104';
		process.env.PORT = '5100';
		setSiteConfig({ routes: {} });

		assert.equal(getSiteConfig().port, 3104);
		assert.equal(getSiteConfig().host, 'http://localhost:3104');
	});

	test('В dev без DEV_PORT использует PORT', () => {
		process.env.DEV = '1';
		process.env.PORT = '5100';
		setSiteConfig({ routes: {} });

		assert.equal(getSiteConfig().port, 5100);
	});

	test('В preview берёт PORT, а не DEV_PORT', () => {
		process.env.DEV = '1';
		process.env.PREVIEW = '1';
		process.env.DEV_PORT = '3104';
		process.env.PORT = '4104';
		setSiteConfig({ routes: {} });

		assert.equal(getSiteConfig().port, 4104);
		assert.equal(getSiteConfig().host, 'http://localhost:4104');
	});

	test('port 0, если PORT в env не задан', () => {
		delete process.env.PORT;
		setSiteConfig({ routes: {} });

		assert.equal(getSiteConfig().port, 0);
		assert.equal(getSiteConfig().host, '');
	});

	test('Сохраняет routes в конфиге на сервере', () => {
		const routes = { '/': {}, '/order': {} };
		setSiteConfig({ routes });

		assert.deepStrictEqual(getSiteConfig().routes, routes);
	});

	test('Формирует baseUrl из baseHost с https', () => {
		setSiteConfig({ baseHost: 'efiand.ru' });
		assert.equal(getSiteConfig().baseHost, 'efiand.ru');
		assert.equal(getSiteConfig().baseUrl, 'https://efiand.ru');
	});

	test('isDev синхронизируется из DEV в setSiteConfig', () => {
		delete process.env.DEV;
		setSiteConfig({});
		assert.equal(getSiteConfig().isDev, false);

		process.env.DEV = '1';
		setSiteConfig({});
		assert.equal(getSiteConfig().isDev, true);
	});

	test('hasDb по умолчанию false', () => {
		assert.equal(getSiteConfig().hasDb, false);
	});

	test('Подмешивает hasDb из configure-site', () => {
		setSiteConfig({ hasDb: true });
		assert.equal(getSiteConfig().hasDb, true);
	});

	test('Объединяет publicPages без дублей', () => {
		setSiteConfig({ publicPages: ['/', '/order'] });
		setSiteConfig({ publicPages: ['/order', '/portfolio'] });

		assert.deepStrictEqual(getSiteConfig().publicPages, new Set(['/', '/order', '/portfolio']));
	});

	test('Выводит publicPages из routes', () => {
		setSiteConfig({
			routes: {
				'/': {},
				'/__/404': {},
				'/__/update': {},
				'/order': {},
				'/portfolio': {},
				'/privacy': {},
				'/sitemap.xml': {},
			},
		});

		assert.deepStrictEqual(getSiteConfig().publicPages, new Set(['/', '/order', '/portfolio', '/privacy']));
		assert.deepStrictEqual(
			getSiteConfig().staticPages,
			new Set(['/', '/order', '/portfolio', '/privacy', '/__/404', '/__/update']),
		);
	});

	test('Подмешивает publicPages после routes', () => {
		setSiteConfig({ routes: { '/': {}, '/order': {} } });
		setSiteConfig({ publicPages: ['/extra'] });

		assert.deepStrictEqual(getSiteConfig().publicPages, new Set(['/', '/order', '/extra']));
	});

	test('staticPages из publicPages без служебных routes', () => {
		setSiteConfig({ publicPages: ['/', '/privacy'] });

		assert.deepStrictEqual(getSiteConfig().staticPages, new Set(['/', '/privacy']));
	});

	test('Добавляет служебные страницы, если есть в routes', () => {
		setSiteConfig({
			publicPages: ['/', '/privacy'],
			routes: {
				'/': {},
				'/__/404': {},
				'/privacy': {},
			},
		});

		assert.deepStrictEqual(getSiteConfig().staticPages, new Set(['/', '/privacy', '/__/404']));
		assert.deepStrictEqual(getSiteConfig().buildPages, new Set(['/', '/privacy', '/__/404', '/sitemap.xml']));
	});

	test('staticPages — копия publicPages', () => {
		setSiteConfig({
			routes: {
				'/': {},
				'/__/404': {},
				'/__/update': {},
				'/order': {},
			},
		});

		const { publicPages, staticPages } = getSiteConfig();

		assert.deepStrictEqual(staticPages, new Set(['/', '/order', '/__/404', '/__/update']));
		assert.notStrictEqual(staticPages, publicPages);

		publicPages.add('/extra');
		assert.deepStrictEqual(staticPages, new Set(['/', '/order', '/__/404', '/__/update']));
	});

	test('buildPages из staticPages и sitemap', () => {
		setSiteConfig({
			routes: {
				'/': {},
				'/__/404': {},
				'/__/update': {},
				'/privacy': {},
			},
		});

		assert.deepStrictEqual(
			getSiteConfig().buildPages,
			new Set(['/', '/privacy', '/__/404', '/__/update', '/sitemap.xml']),
		);
	});

	test('Добавляет /404.html при наличии route', () => {
		setSiteConfig({
			routes: {
				'/': {},
				'/404.html': {},
				'/sitemap.xml': {},
			},
		});

		assert.deepStrictEqual(getSiteConfig().publicPages, new Set(['/']));
		assert.deepStrictEqual(getSiteConfig().staticPages, new Set(['/', '/404.html']));
		assert.deepStrictEqual(getSiteConfig().buildPages, new Set(['/', '/404.html', '/sitemap.xml']));
	});
});
