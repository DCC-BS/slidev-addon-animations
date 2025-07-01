import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      '**/__tests__/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'utils/**/*.ts',
        'composables/**/*.ts',
        'types/**/*.ts'
      ],
      exclude: [
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        'setup/**',
        'components/**', // Vue components can be tested separately if needed
        '**/node_modules/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Better error reporting
    outputFile: {
      junit: './coverage/junit.xml'
    },
    // Improved test isolation
    isolate: true,
    // Pool options for better performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/utils': resolve(__dirname, 'utils'),
      '@/types': resolve(__dirname, 'types'),
      '@/composables': resolve(__dirname, 'composables'),
      '@/components': resolve(__dirname, 'components')
    },
  },
})
