import { defineConfig } from 'tsup';
import {
  commonWatchList,
  monorepoWatchList,
  targetFromNodeVersion,
  watchEntryPlugin,
} from './utils';

export default defineConfig({
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  format: 'esm',
  watch: process.env.WATCH === '0' ? false : [...commonWatchList(), ...monorepoWatchList()],
  target: targetFromNodeVersion(),
  plugins: [watchEntryPlugin()],
});
