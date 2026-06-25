/// <reference path="../../types/index.d.ts" />

declare function clearConsent(): void;
declare function parseConsentCookie(cookieHeader: string, cookieName: string): CookieConsentValue | undefined;
declare function readConsent(): CookieConsentValue | undefined;
declare function writeConsent(value: CookieConsentValue): void;

export { clearConsent, parseConsentCookie, readConsent, writeConsent };
