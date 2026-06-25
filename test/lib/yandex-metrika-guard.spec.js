import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { shouldIncludeYandexMetrika } from '#core/common/lib/yandex-metrika-guard.js';

describe('Общее/yandex-metrika-guard', () => {
	beforeEach(() => {
		setSiteConfig({ yandexMetrikaId: 102299682 });
	});

	afterEach(() => {
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('shouldIncludeYandexMetrika false без id счётчика', () => {
		setSiteConfig({ yandexMetrikaId: 0 });
		assert.equal(shouldIncludeYandexMetrika({ pathname: '/' }), false);
	});

	test('shouldIncludeYandexMetrika false на служебных маршрутах', () => {
		assert.equal(shouldIncludeYandexMetrika({ pathname: '/__/404' }), false);
	});

	test('shouldIncludeYandexMetrika true для публичных страниц', () => {
		assert.equal(shouldIncludeYandexMetrika({ pathname: '/' }), true);
	});

	test('shouldIncludeYandexMetrika false при excludePathnamePrefixes по requestPathname', () => {
		setSiteConfig({
			cookieConsent: { excludePathnamePrefixes: ['/manuscript'] },
			yandexMetrikaId: 102299682,
		});

		assert.equal(shouldIncludeYandexMetrika({ pathname: '/mad/1', requestPathname: '/manuscript/mad/1' }), false);
		assert.equal(shouldIncludeYandexMetrika({ pathname: '/mad/1', requestPathname: '/mad/1' }), true);
		assert.equal(shouldIncludeYandexMetrika({ pathname: '/manuscript/mad/1' }), false);
	});
});
