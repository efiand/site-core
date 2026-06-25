import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { renderCookieConsent } from '#core/common/templates/cookie-consent.js';

describe('Общее/cookie-consent', () => {
	beforeEach(() => {
		setSiteConfig({ yandexMetrikaId: 102299682 });
	});

	afterEach(() => {
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('renderCookieConsent рендерит баннер с кнопками и ссылкой на privacy', () => {
		const markup = renderCookieConsent({ pathname: '/' });

		assert.match(markup, /class="cookie-consent"/);
		assert.match(markup, /data-cookie-consent-accept/);
		assert.match(markup, /data-cookie-consent-reject/);
		assert.match(markup, /href="\/privacy"/);
		assert.match(markup, /class="cookie-consent" hidden/);
		assert.match(markup, /removeAttribute\('hidden'\)/);
	});

	test('renderCookieConsent без id счётчика — пустая строка', () => {
		setSiteConfig({ yandexMetrikaId: 0 });

		assert.equal(renderCookieConsent({ pathname: '/' }), '');
	});

	test('renderCookieConsent пропускает служебные маршруты под /__', () => {
		assert.equal(renderCookieConsent({ pathname: '/__/404' }), '');
	});

	test('renderCookieConsent с showDelayMsByPathname добавляет data-атрибуты', () => {
		setSiteConfig({
			cookieConsent: {
				showDelayMsByPathname: {
					'/': 5200,
				},
				showDelayMsReducedMotionByPathname: {
					'/': 2000,
				},
			},
			yandexMetrikaId: 102299682,
		});

		const markup = renderCookieConsent({ pathname: '/' });

		assert.match(markup, /data-cookie-consent-show-delay="5200"/);
		assert.match(markup, /data-cookie-consent-show-delay-reduced="2000"/);
		assert.match(markup, /setTimeout\(showBanner, delayMs\)/);
	});
});
