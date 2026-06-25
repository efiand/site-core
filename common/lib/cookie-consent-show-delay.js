/// <reference path="../../types/index.d.ts" />

import { getSiteConfig } from '#core/common/lib/site-config.js';

/** @type {(pathname?: string) => CookieConsentShowDelay} */
function resolveCookieConsentShowDelay(pathname = '') {
	const { cookieConsent = {} } = getSiteConfig();
	const { showDelayMs = 0, showDelayMsByPathname = {}, showDelayMsReducedMotionByPathname = {} } = cookieConsent;

	return {
		showDelayMs: showDelayMsByPathname[pathname] ?? showDelayMs,
		showDelayMsReducedMotion: showDelayMsReducedMotionByPathname[pathname] ?? 0,
	};
}

export { resolveCookieConsentShowDelay };
