/// <reference path="../../types/index.d.ts" />

import {
	COOKIE_CONSENT_COOKIE_NAME,
	COOKIE_CONSENT_MAX_AGE_SECONDS,
} from '#core/common/lib/cookie-consent-constants.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';

/** @type {() => Required<Pick<CookieConsentConfig, 'cookieName' | 'maxAgeSeconds'>> & Pick<CookieConsentConfig, 'domain'>} */
function getCookieConsentStorageConfig() {
	const { cookieConsent = {} } = getSiteConfig();

	return {
		cookieName: cookieConsent.cookieName ?? COOKIE_CONSENT_COOKIE_NAME,
		domain: cookieConsent.domain,
		maxAgeSeconds: cookieConsent.maxAgeSeconds ?? COOKIE_CONSENT_MAX_AGE_SECONDS,
	};
}

export { getCookieConsentStorageConfig };
