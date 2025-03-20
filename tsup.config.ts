import {defineConfig} from 'tsup';


export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  target: 'es2022',
  minify: true,
  splitting: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  shims: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});