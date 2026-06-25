type SiteConfigVersion = {
	CSS: number;
	JS: number;
};

type SiteConfigState = {
	author: string;
	baseHost: string;
	baseUrl: string;
	buildPages: Set<string>;
	cookieConsent: CookieConsentConfig;
	email: string;
	hasDb: boolean;
	host: string;
	isDev: boolean;
	port: number;
	privacyRevisionDate: SiteDatetimeInput;
	projectDescription: string;
	projectTitle: string;
	pubDate: string;
	publicPages: Set<string>;
	routes: Record<string, Route> | null;
	staticPages: Set<string>;
	version: SiteConfigVersion;
	yandexMetrikaId: number;
};

type SiteConfigPatch = Partial<
	Omit<SiteConfigState, 'baseUrl' | 'buildPages' | 'host' | 'isDev' | 'port' | 'publicPages' | 'routes' | 'staticPages'>
> & {
	publicPages?: Iterable<string>;
	routes?: Record<string, Route>;
};
