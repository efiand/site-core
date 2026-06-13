#!/usr/bin/env node
import { createDevMiddleware } from '#core/server/lib/dev-middleware.js';
import { loadCreateApp } from './load-create-app.js';

const createApp = await loadCreateApp();

createApp({ middleware: createDevMiddleware() });
