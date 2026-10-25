// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

// Semua dependensi berat di-mock: tidak ada server Vite sungguhan, tidak ada port yang dibuka.
const createViteServer = vi.fn(async () => ({ middlewares: vi.fn() }));
const listen = vi.fn((_port: number, _host: string, cb?: () => void) => cb?.());
const use = vi.fn();

vi.mock('vite', () => ({ createServer: (...args: unknown[]) => createViteServer(...(args as [])) }));
vi.mock('../app', () => ({
  createExpressApp: () => ({ use, get: vi.fn(), listen }),
}));

async function loadEntry() {
  vi.resetModules();
  await import('../../server');
  // startServer() berjalan asinkron; tunggu sampai listen dipanggil
  await vi.waitFor(() => expect(listen).toHaveBeenCalled());
}

describe('server.ts entry point', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('in development mounts the Vite dev server as middleware and listens on port 3000', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.PORT;

    await loadEntry();

    expect(createViteServer).toHaveBeenCalledTimes(1);
    expect(use).toHaveBeenCalled(); // vite.middlewares dipasang ke express
    expect(listen).toHaveBeenCalledWith(3000, '0.0.0.0', expect.any(Function));
  });

  it('in production serves the static build instead of starting Vite', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4321';

    await loadEntry();

    expect(createViteServer).not.toHaveBeenCalled();
    expect(listen).toHaveBeenCalledWith(4321, '0.0.0.0', expect.any(Function));
  });
});
