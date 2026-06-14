/// <reference path="../types/index.d.ts" />

declare function assertPrivacyPolicyPage(page: LayoutData | undefined, options?: PrivacyRouteTestsOptions): void;

declare function registerPrivacyRouteTests(privacyRoute: Route, options?: PrivacyRouteTestsOptions): void;

export { assertPrivacyPolicyPage, registerPrivacyRouteTests };
