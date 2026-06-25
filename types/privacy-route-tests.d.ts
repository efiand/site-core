type PrivacyRouteTestsOptions = {
	email?: string;
	hasCookieConsent?: boolean;
	hasEmail?: boolean;
	patterns?: RegExp[];
};

declare function registerPrivacyRouteTests(privacyRoute: Route, options?: PrivacyRouteTestsOptions): void;
