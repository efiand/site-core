#!/usr/bin/env node
import { generateHostFonts } from './generate-host-fonts.js';
import { installHostPreCommit } from './install-pre-commit.js';
import { linkDevConfig } from './link-dev-config.js';

const hostRoot = process.cwd();

linkDevConfig(hostRoot);
generateHostFonts(hostRoot);
installHostPreCommit(hostRoot);
