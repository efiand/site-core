import type { Window } from 'happy-dom';

declare function setupDomFixture(options?: { height?: number; html?: string; url?: string; width?: number }): Window;

declare function teardownDomFixture(): void;

export { setupDomFixture, teardownDomFixture };
