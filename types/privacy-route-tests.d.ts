type PrivacyRouteTestsOptions = {
	email?: string;
	hasEmail?: boolean;
	patterns?: RegExp[];
};

declare function registerPrivacyRouteTests(privacyRoute: Route, options?: PrivacyRouteTestsOptions): void;
