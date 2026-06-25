import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';
import { resolveCookieConsentShowDelay } from '#core/common/lib/cookie-consent-show-delay.js';
import { setSiteConfig } from '#core/common/lib/site-config.js';

describe('Общее/cookie-consent-show-delay', () => {
	afterEach(() => {
		setSiteConfig({ cookieConsent: {} });
	});

	test('resolveCookieConsentShowDelay без конфига — нули', () => {
		assert.deepEqual(resolveCookieConsentShowDelay('/'), {
			showDelayMs: 0,
			showDelayMsReducedMotion: 0,
		});
	});

	test('resolveCookieConsentShowDelay берёт showDelayMs по pathname', () => {
		setSiteConfig({
			cookieConsent: {
				showDelayMs: 1000,
				showDelayMsByPathname: {
					'/': 5200,
				},
				showDelayMsReducedMotionByPathname: {
					'/': 2000,
				},
			},
		});

		assert.deepEqual(resolveCookieConsentShowDelay('/'), {
			showDelayMs: 5200,
			showDelayMsReducedMotion: 2000,
		});
		assert.deepEqual(resolveCookieConsentShowDelay('/order'), {
			showDelayMs: 1000,
			showDelayMsReducedMotion: 0,
		});
	});
});
