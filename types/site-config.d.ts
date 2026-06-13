type SiteConfigVersion = {
	CSS: number;
	JS: number;
};

type SiteConfigState = {
	baseHost: string;
	baseUrl: string;
	email: string;
	hasDb: boolean;
	host: string;
	isDev: boolean;
	port: number;
	projectDescription: string;
	projectTitle: string;
	publicPages: Set<string>;
	routes: Record<string, Route> | null;
	buildPages: Set<string>;
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
