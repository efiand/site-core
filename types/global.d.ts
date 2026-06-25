interface Window {
	/** Dev-режим (inline-скрипт в SSR или process.env.DEV на сервере) */
	DEV?: boolean | number | string;

	/** Очередь SPA hit-ов до загрузки tag.js */
	__metrikaHitsQueue?: {
		title?: string;
		url: string;
	}[];

	/** Yandex.Metrika stub до загрузки tag.js */
	ym?: ((...args: unknown[]) => void) & {
		a?: unknown[][];
		l?: number;
	};

	/** Отложенный показ cookie-баннера (inline-скрипт и client) */
	__siteCoreCookieConsentRevealTimeout?: number;
}

namespace NodeJS {
	interface ProcessEnv {
		APP_ROOT?: string;
		AUTH_HASH?: string;
		AUTH_LOGIN?: string;
		AUTH_PASSWORD?: string;
		AUTH_SECRET?: string;
		DB_HOST?: string;
		DB_NAME?: string;
		DB_PASSWORD?: string;
		DB_USER?: string;
		DEV?: string;
		DEV_PORT?: string;
		PORT?: string;
		PREVIEW?: string;
		PROJECT_ROOT?: string;
		YADISK_TOKEN?: string;
	}
}
