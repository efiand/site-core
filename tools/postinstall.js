#!/usr/bin/env node
import { generateHostFonts } from './generate-host-fonts.js';
import { installHostPreCommit } from './install-pre-commit.js';
import { linkDevConfig, linkHostCoreCss } from './link-dev-config.js';
import { restoreRolldownWasmLockfile } from './restore-rolldown-wasm-lockfile.js';

const hostRoot = process.cwd();

linkDevConfig(hostRoot);
linkHostCoreCss(hostRoot);
generateHostFonts(hostRoot);
installHostPreCommit(hostRoot);
restoreRolldownWasmLockfile(hostRoot);
