type CreateAppFn = (options?: CreateAppOptions) => import('node:http').Server;

type IntegrationFixture = {
	allPages: string[];
	getMarkup: (page?: string) => Promise<string>;
	getMarkups: () => string[];
	getServer: () => import('node:http').Server | undefined;
};

type UseIntegrationFixtureOptions = {
	createApp: CreateAppFn;
	excludePages?: string[];
};
