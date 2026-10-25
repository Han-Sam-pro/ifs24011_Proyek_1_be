import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.APP_PORT) || 3000;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: { port },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      // Vitest hanya menjalankan test Vitest. File dengan `bun:test` (folder tests/)
      // dijalankan terpisah lewat `bun test` (lihat script test:bun di package.json).
      // Mesin lambat (mis. Windows/Jenkins) butuh waktu lebih lama untuk render App penuh
      testTimeout: 20000,
      hookTimeout: 20000,
      include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
      exclude: ['tests/**', 'node_modules/**', 'dist/**'],
      // Laporan coverage untuk SonarQube: sonar-project.properties membaca coverage/lcov.info
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/__tests__/**',
          'src/**/*.d.ts',
          'src/main.tsx',
          'src/setupTests.ts',
        ],
      },
    },
  };
});
