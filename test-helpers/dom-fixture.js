// @ts-nocheck
import { Window } from 'happy-dom';

/** @type {unknown} */
let previousDocument;

/** @type {unknown} */
let previousWindow;

/** @type {Window | undefined} */
let windowInstance;

/** @type {(options?: { height?: number, html?: string, url?: string, width?: number }) => Window} */
function setupDomFixture(options = {}) {
	if (windowInstance) {
		windowInstance.close();
	}

	windowInstance = new Window({
		height: options.height ?? 768,
		url: options.url ?? 'http://localhost/',
		width: options.width ?? 1024,
	});

	previousWindow = globalThis.window;
	previousDocument = globalThis.document;

	globalThis.window = windowInstance;
	globalThis.document = windowInstance.document;
	globalThis.HTMLElement = windowInstance.HTMLElement;
	globalThis.MouseEvent = windowInstance.MouseEvent;
	globalThis.TouchEvent = windowInstance.TouchEvent;
	globalThis.PointerEvent = windowInstance.PointerEvent;
	globalThis.history = windowInstance.history;
	globalThis.location = windowInstance.location;

	windowInstance.document.body.innerHTML = options.html ?? '';

	return windowInstance;
}

function teardownDomFixture() {
	if (!windowInstance) {
		return;
	}

	windowInstance.close();
	windowInstance = undefined;

	if (previousWindow) {
		globalThis.window = previousWindow;
	}
	if (previousDocument) {
		globalThis.document = previousDocument;
	}
}

export { setupDomFixture, teardownDomFixture };
