/// <reference path="../../types/index.d.ts" />

import { initCookieConsent } from '#core/client/lib/init-cookie-consent.js';

/** @type {() => void} */
function initSiteClient() {
	if (typeof globalThis.window === 'undefined') {
		return;
	}

	initCookieConsent();
}

export { initSiteClient };
