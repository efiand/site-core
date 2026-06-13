import { register } from 'node:module';

register('./vendor-resolver.js', import.meta.url);
