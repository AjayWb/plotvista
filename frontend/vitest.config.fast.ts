import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Optimizations for faster test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    },
    isolate: false,
    passWithNoTests: true,
    // Only run unit tests for quick validation
    include: ['src/test/store.test.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 5000,
    hookTimeout: 5000
  },
})