type CookieConsentShowDelay = {
	showDelayMs: number;
	showDelayMsReducedMotion: number;
};

declare function resolveCookieConsentShowDelay(pathname?: string): CookieConsentShowDelay;

export { resolveCookieConsentShowDelay };
