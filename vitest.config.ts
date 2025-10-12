import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['backend/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
