/// <reference path="../../types/index.d.ts" />

declare function resolveYandexMetrikaCounterId(counterId?: number): number;

declare function getCookieConsentPathCandidates(pathname?: string, requestPathname?: string): string[];

declare function isExcludedCookieConsentPath(pathname?: string, requestPathname?: string): boolean;

declare function shouldIncludeYandexMetrika(
	options?: Pick<YandexMetrikaOptions, 'counterId' | 'pathname' | 'requestPathname'>,
): boolean;

export {
	getCookieConsentPathCandidates,
	isExcludedCookieConsentPath,
	resolveYandexMetrikaCounterId,
	shouldIncludeYandexMetrika,
};
