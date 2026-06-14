import { setSiteConfig } from 'site-core/common/lib/site-config.js';

setSiteConfig({
	baseHost: 'example.com',
	email: 'hello@example.com',
	projectDescription: 'Example site description.',
	projectTitle: 'example',
	version: {
		CSS: 1,
		JS: 1,
	},
	yandexMetrikaId: 12345678,
});

// privacyRevisionDate: '2026-06-09', // SiteDatetimeInput — тот же формат, что date в renderTimeTag

// app/server/lib/app.js — после import { routes } from '#server/routes/index.js':
// setSiteConfig({ routes });
//
// Порт — только из окружения: DEV_PORT (dev, site-core-dev), PORT (preview, prod, CI, systemd).
// author: 'Author Name',
// pubDate: new Date().toISOString(),
// hasDb: true,
//
// Служебные страницы — только если зарегистрированы в routes:
// nginx: /__/404, /__/update; GitHub Pages: /404.html
