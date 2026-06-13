#!/usr/bin/env node

import { buildStaticPages } from './build-static-pages.js';
import { loadCreateApp } from './load-create-app.js';

const createApp = await loadCreateApp();

await buildStaticPages({ createApp });
