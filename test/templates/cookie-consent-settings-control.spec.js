import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { renderCookieConsentSettingsControl } from '#core/common/templates/cookie-consent-settings-control.js';

describe('Общее/cookie-consent-settings-control', () => {
	beforeEach(() => {
		setSiteConfig({ yandexMetrikaId: 102299682 });
	});

	afterEach(() => {
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('renderCookieConsentSettingsControl рендерит кнопку с data-атрибутом', () => {
		const markup = renderCookieConsentSettingsControl({ className: 'footer-link', pathname: '/' });

		assert.match(markup, /data-cookie-consent-settings/);
		assert.match(markup, /class="footer-link"/);
		assert.match(markup, / hidden/);
		assert.match(markup, /Настройки cookie/);
	});

	test('renderCookieConsentSettingsControl без id счётчика — пустая строка', () => {
		setSiteConfig({ yandexMetrikaId: 0 });

		assert.equal(renderCookieConsentSettingsControl({ pathname: '/' }), '');
	});

	test('renderCookieConsentSettingsControl пропускает служебные маршруты под /__', () => {
		assert.equal(renderCookieConsentSettingsControl({ pathname: '/__/404' }), '');
	});

	test('renderCookieConsentSettingsControl пропускает excludePathnamePrefixes по requestPathname', () => {
		setSiteConfig({
			cookieConsent: { excludePathnamePrefixes: ['/manuscript'] },
			yandexMetrikaId: 102299682,
		});

		assert.equal(
			renderCookieConsentSettingsControl({
				className: 'footer-link',
				pathname: '/mad/1',
				requestPathname: '/manuscript/mad/1',
			}),
			'',
		);
	});
});
