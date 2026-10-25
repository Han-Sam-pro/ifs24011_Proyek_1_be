// @vitest-environment node
import fs from 'fs';
import os from 'os';
import path from 'path';
import type { AddressInfo } from 'net';
import type { Server } from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Database sementara per proses test, supaya tidak menyentuh data/roamplan.db
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'roamplan-test-'));
process.env.SQLITE_PATH = path.join(tmpDir, 'test.db');

let server: Server;
let base = '';

const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

const makeTrip = (id: string, title: string) => ({
  id,
  title,
  destinationCity: 'Yogyakarta',
  startDate: '2026-11-01',
  endDate: '2026-11-02',
  currency: 'IDR',
  totalBudget: 1000000,
  days: [],
});

beforeAll(async () => {
  const { createExpressApp } = await import('../app');
  server = createExpressApp().listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const { port } = server.address() as AddressInfo;
  base = `http://127.0.0.1:${port}/api`;
});

afterAll(async () => {
  // Tutup koneksi HTTP lalu server, baru koneksi database
  server?.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));

  const { closeDb } = await import('../db');
  closeDb();

  // Di Windows, penghapusan bisa gagal sesaat (EPERM) jika file masih dipakai; coba ulang
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
});

describe('RoamPlan API (SQLite)', () => {
  it('registers, rejects duplicates and logs in', async () => {
    const reg = await fetch(`${base}/auth/register`, json({ name: 'A', email: 'a@example.com', password: 'secret1' }));
    expect(reg.status).toBe(201);
    const body = await reg.json();
    expect(body.data.user.email).toBe('a@example.com');
    expect(body.data.user.password_hash).toBeUndefined();

    const dup = await fetch(`${base}/auth/register`, json({ name: 'A', email: 'A@example.com', password: 'secret1' }));
    expect(dup.status).toBe(409);

    const bad = await fetch(`${base}/auth/login`, json({ email: 'a@example.com', password: 'salah' }));
    expect(bad.status).toBe(401);

    const ok = await fetch(`${base}/auth/login`, json({ email: 'a@example.com', password: 'secret1' }));
    expect(ok.status).toBe(200);
  });

  it('protects routes that need a valid token', async () => {
    const res = await fetch(`${base}/users/me`);
    expect(res.status).toBe(401);
    const res2 = await fetch(`${base}/trips`, { headers: auth('token-palsu') });
    expect(res2.status).toBe(401);
  });

  it('saves, updates and lists trips per user', async () => {
    const login = await (await fetch(`${base}/auth/login`, json({ email: 'a@example.com', password: 'secret1' }))).json();
    const token: string = login.data.token;

    await fetch(`${base}/trips`, { ...json(makeTrip('t1', 'Jogja')), headers: { 'Content-Type': 'application/json', ...auth(token) } });
    await fetch(`${base}/trips`, { ...json(makeTrip('t1', 'Jogja v2')), headers: { 'Content-Type': 'application/json', ...auth(token) } });

    const list = await (await fetch(`${base}/trips`, { headers: auth(token) })).json();
    expect(list.data.trips).toHaveLength(1);
    expect(list.data.trips[0].title).toBe('Jogja v2');
  });

  it('keeps trips with the same id separate between users', async () => {
    await fetch(`${base}/auth/register`, json({ name: 'B', email: 'b@example.com', password: 'secret2' }));
    const loginB = await (await fetch(`${base}/auth/login`, json({ email: 'b@example.com', password: 'secret2' }))).json();
    const tokenB: string = loginB.data.token;

    await fetch(`${base}/trips`, { ...json(makeTrip('t1', 'Milik B')), headers: { 'Content-Type': 'application/json', ...auth(tokenB) } });
    const listB = await (await fetch(`${base}/trips`, { headers: auth(tokenB) })).json();
    expect(listB.data.trips.map((t: { title: string }) => t.title)).toEqual(['Milik B']);
  });

  it('rejects an invalid trip payload', async () => {
    const login = await (await fetch(`${base}/auth/login`, json({ email: 'a@example.com', password: 'secret1' }))).json();
    const res = await fetch(`${base}/trips`, { ...json({ title: 'tanpa id' }), headers: { 'Content-Type': 'application/json', ...auth(login.data.token) } });
    expect(res.status).toBe(400);
  });

  it('invalidates the token after logout', async () => {
    const login = await (await fetch(`${base}/auth/login`, json({ email: 'a@example.com', password: 'secret1' }))).json();
    const token: string = login.data.token;

    const out = await fetch(`${base}/auth/logout`, { method: 'POST', headers: auth(token) });
    expect(out.status).toBe(200);

    const me = await fetch(`${base}/users/me`, { headers: auth(token) });
    expect(me.status).toBe(401);
  });
});
