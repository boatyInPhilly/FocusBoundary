/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig(({ command }) => {
  // `vitest`: run the test suite from the project root.
  if (process.env.VITEST) {
    return {
      plugins: [react()],
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [resolve(__dirname, 'test/setup.ts')],
        include: ['test/**/*.test.{ts,tsx}'],
      },
    }
  }

  // `vite` (dev server): serve the example app.
  if (command === 'serve') {
    return {
      root: resolve(__dirname, 'example'),
      plugins: [react()],
    }
  }

  // `vite build`: build the library from src/ only.
  return {
    plugins: [react(), dts({ tsconfigPath: './tsconfig.build.json', rollupTypes: true })],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es'],
        fileName: 'index',
      },
      rollupOptions: {
        // Never bundle React (a peer dependency) or tabbable (a dependency);
        // the consumer's package manager installs them.
        external: ['react', 'react-dom', 'react/jsx-runtime', 'tabbable'],
        output: {
          // Mark the bundle as client code for React Server Components (e.g. the
          // Next.js App Router). Other environments ignore the directive.
          banner: "'use client'",
        },
      },
      sourcemap: true,
      emptyOutDir: true,
    },
  }
})
