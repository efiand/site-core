/// <reference path="../types/index.d.ts" />

declare function getIntegrationBuildPages(options?: { excludePages?: string[] }): string[];

declare function registerMarkupValidationTests(fixture: IntegrationFixture): void;

declare function useIntegrationFixture(options: UseIntegrationFixtureOptions): IntegrationFixture;

export { getIntegrationBuildPages, registerMarkupValidationTests, useIntegrationFixture };
