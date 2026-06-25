/// <reference path="../../types/index.d.ts" />

import {
	COOKIE_CONSENT_VALUE_ACCEPTED,
	COOKIE_CONSENT_VALUE_REJECTED,
} from '#core/common/lib/cookie-consent-constants.js';
import { getCookieConsentStorageConfig } from '#core/common/lib/cookie-consent-storage-config.js';

/** @type {() => void} */
function clearConsent() {
	const { cookieName, domain } = getCookieConsentStorageConfig();
	const domainPart = domain ? `; domain=${domain}` : '';

	// biome-ignore lint/suspicious/noDocumentCookie: first-party consent cookie
	document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Lax${domainPart}`;
}

/** @type {(cookieHeader: string, cookieName: string) => CookieConsentValue | undefined} */
function parseConsentCookie(cookieHeader, cookieName) {
	for (const part of cookieHeader.split(';')) {
		const [name, ...valueParts] = part.trim().split('=');
		if (name !== cookieName) {
			continue;
		}

		const value = valueParts.join('=');
		if (value === COOKIE_CONSENT_VALUE_ACCEPTED || value === COOKIE_CONSENT_VALUE_REJECTED) {
			return value;
		}
	}

	return undefined;
}

/** @type {() => CookieConsentValue | undefined} */
function readConsent() {
	if (typeof document === 'undefined') {
		return undefined;
	}

	return parseConsentCookie(document.cookie, getCookieConsentStorageConfig().cookieName);
}

/** @type {(value: CookieConsentValue) => void} */
function writeConsent(value) {
	const { cookieName, domain, maxAgeSeconds } = getCookieConsentStorageConfig();
	const domainPart = domain ? `; domain=${domain}` : '';

	// biome-ignore lint/suspicious/noDocumentCookie: first-party consent cookie
	document.cookie = `${cookieName}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${domainPart}`;
}

export { clearConsent, parseConsentCookie, readConsent, writeConsent };
