import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';

let server;
let db;
let base;

before(async () => {
  db = await openDatabase({ url: 'file::memory:' });
  server = createApp({ db }).listen(0);
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await db.close();
});

async function call(method, path, { body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

const alice = { name: 'Alice Samosir', username: 'alice01', email: 'alice@example.com', password: 'rahasia123' };
const bob = { name: 'Bob Toba', username: 'bob_toba', email: 'bob@example.com', password: 'sandi4567' };

let aliceToken;
let bobToken;

const tripBody = (overrides = {}) => ({
  title: 'Keliling Danau Toba',
  destination: 'Samosir',
  start_date: '2026-11-10',
  end_date: '2026-11-11',
  budget: 1000000,
  ...overrides,
});

describe('autentikasi', () => {
  test('registrasi berhasil mengembalikan token dan profil publik', async () => {
    const res = await call('POST', '/auth/register', { body: alice });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.username, 'alice01');
    assert.equal(res.body.data.password_hash, undefined);
    aliceToken = res.body.data.token;
  });

  test('registrasi dengan username yang sama ditolak (409)', async () => {
    const res = await call('POST', '/auth/register', { body: { ...alice, email: 'lain@example.com' } });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.details.username, 'Username sudah dipakai');
  });

  test('kata sandi tanpa angka ditolak (400) dengan detail per field', async () => {
    const res = await call('POST', '/auth/register', { body: { ...bob, password: 'hanyahuruf' } });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.password);
  });

  test('login dengan kata sandi salah ditolak (401)', async () => {
    const res = await call('POST', '/auth/login', { body: { username: 'alice01', password: 'salah' } });
    assert.equal(res.status, 401);
  });

  test('login berhasil dan /auth/me mengenali token', async () => {
    const login = await call('POST', '/auth/login', { body: { username: 'alice01', password: alice.password } });
    assert.equal(login.status, 200);
    const me = await call('GET', '/auth/me', { token: login.body.data.token });
    assert.equal(me.status, 200);
    assert.equal(me.body.data.name, 'Alice Samosir');
  });

  test('/auth/me tanpa token ditolak (401)', async () => {
    const res = await call('GET', '/auth/me');
    assert.equal(res.status, 401);
  });

  test('registrasi Bob untuk pengujian kepemilikan data', async () => {
    const res = await call('POST', '/auth/register', { body: bob });
    assert.equal(res.status, 201);
    bobToken = res.body.data.token;
  });
});

describe('pengguna dan profil', () => {
  test('daftar pengguna memuat semua akun tanpa email', async () => {
    const res = await call('GET', '/users?limit=10', { token: aliceToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.meta.total, 2);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.data[0].email, undefined);
  });

  test('pencarian pengguna berdasarkan nama', async () => {
    const res = await call('GET', '/users?q=toba', { token: aliceToken });
    assert.deepEqual(res.body.data.map((u) => u.username), ['bob_toba']);
  });

  test('profil dapat diubah', async () => {
    const res = await call('PUT', '/profile', {
      token: aliceToken,
      body: { name: 'Alice Samosir', email: 'alice@example.com', phone: '0812-3456-789', bio: 'Suka pantai dan kopi' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.bio, 'Suka pantai dan kopi');
    assert.equal(res.body.data.trip_count, 0);
  });

  test('email yang dipakai akun lain ditolak (409)', async () => {
    const res = await call('PUT', '/profile', {
      token: aliceToken,
      body: { name: 'Alice Samosir', email: 'bob@example.com' },
    });
    assert.equal(res.status, 409);
  });

  test('ganti kata sandi memerlukan kata sandi lama yang benar', async () => {
    const wrong = await call('PUT', '/profile/password', {
      token: aliceToken,
      body: { current_password: 'bukan-itu', new_password: 'baru12345' },
    });
    assert.equal(wrong.status, 400);

    const ok = await call('PUT', '/profile/password', {
      token: aliceToken,
      body: { current_password: alice.password, new_password: 'baru12345' },
    });
    assert.equal(ok.status, 200);

    const relogin = await call('POST', '/auth/login', { body: { username: 'alice01', password: 'baru12345' } });
    assert.equal(relogin.status, 200);
  });
});

describe('rencana perjalanan', () => {
  let tripId;
  let day1StopIds;

  test('tanggal selesai sebelum mulai ditolak', async () => {
    const res = await call('POST', '/trips', {
      token: aliceToken,
      body: tripBody({ start_date: '2026-11-10', end_date: '2026-11-08' }),
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.details.end_date);
  });

  test('durasi lebih dari 30 hari ditolak', async () => {
    const res = await call('POST', '/trips', {
      token: aliceToken,
      body: tripBody({ start_date: '2026-11-01', end_date: '2026-12-15' }),
    });
    assert.equal(res.status, 400);
  });

  test('membuat rencana menghasilkan satu entri hari per tanggal', async () => {
    const res = await call('POST', '/trips', { token: aliceToken, body: tripBody() });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.day_count, 2);
    assert.equal(res.body.data.days.length, 2);
    assert.equal(res.body.data.days[1].date, '2026-11-11');
    tripId = res.body.data.id;
  });

  test('menambah destinasi dengan jam dan biaya', async () => {
    const stops = [
      { day_number: 1, name: 'Tomok', category: 'wisata', lat: 2.5583, lng: 98.9038, arrival_time: '10:00', duration_min: 90, cost: 50000 },
      { day_number: 1, name: 'Pantai Parbaba', category: 'kuliner', lat: 2.5294, lng: 98.8667, arrival_time: '08:00', duration_min: 60, cost: 120000 },
      { day_number: 1, name: 'Ambarita', category: 'wisata', lat: 2.5667, lng: 98.8817, duration_min: 45, cost: 30000 },
    ];
    for (const body of stops) {
      const res = await call('POST', `/trips/${tripId}/stops`, { token: aliceToken, body });
      assert.equal(res.status, 201);
    }
    const detail = await call('GET', `/trips/${tripId}`, { token: aliceToken });
    const day1 = detail.body.data.days[0];
    assert.equal(day1.stops.length, 3);
    assert.equal(day1.activity_cost, 200000);
    assert.equal(detail.body.data.costs.activity_cost, 200000);
    assert.ok(day1.distance_km > 0, 'jarak harian dihitung dari koordinat');
    day1StopIds = day1.stops.map((s) => s.id);
  });

  test('urutan berdasarkan waktu menaruh destinasi paling pagi di depan', async () => {
    const res = await call('POST', `/trips/${tripId}/days/1/reorder`, { token: aliceToken, body: { mode: 'time' } });
    const names = res.body.data.days[0].stops.map((s) => s.name);
    assert.deepEqual(names, ['Pantai Parbaba', 'Tomok', 'Ambarita']);
  });

  test('urutan berdasarkan jarak tidak lebih panjang dari urutan waktu', async () => {
    const byTime = (await call('GET', `/trips/${tripId}`, { token: aliceToken })).body.data.days[0].distance_km;
    const res = await call('POST', `/trips/${tripId}/days/1/reorder`, { token: aliceToken, body: { mode: 'distance' } });
    assert.ok(res.body.data.days[0].distance_km <= byTime + 1e-9);
  });

  test('mode urutan yang tidak dikenal ditolak', async () => {
    const res = await call('POST', `/trips/${tripId}/days/1/reorder`, { token: aliceToken, body: { mode: 'acak' } });
    assert.equal(res.status, 400);
  });

  test('destinasi di luar rentang hari ditolak', async () => {
    const res = await call('POST', `/trips/${tripId}/stops`, {
      token: aliceToken,
      body: { day_number: 5, name: 'Hari Terlalu Jauh', lat: 2.6, lng: 98.8, cost: 0 },
    });
    assert.equal(res.status, 400);
  });

  test('mengubah destinasi dan memindahkannya ke hari lain', async () => {
    const res = await call('PUT', `/trips/${tripId}/stops/${day1StopIds[0]}`, {
      token: aliceToken,
      body: { day_number: 2, name: 'Tomok (pindah)', category: 'wisata', lat: 2.5583, lng: 98.9038, arrival_time: '09:00', duration_min: 90, cost: 50000 },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.days[1].stops[0].name, 'Tomok (pindah)');
  });

  test('mengecilkan rentang tanggal ditolak bila masih ada destinasi di hari yang hilang', async () => {
    const res = await call('PUT', `/trips/${tripId}`, {
      token: aliceToken,
      body: tripBody({ end_date: '2026-11-10' }),
    });
    assert.equal(res.status, 400);
  });

  test('anggaran terlampaui ditandai pada ringkasan daftar', async () => {
    await call('PUT', `/trips/${tripId}`, { token: aliceToken, body: tripBody({ budget: 100000 }) });
    const list = await call('GET', '/trips', { token: aliceToken });
    const trip = list.body.data.find((t) => t.id === tripId);
    assert.equal(trip.over_budget, true);
    assert.equal(trip.stop_count, 3);
  });

  test('pencarian rencana berdasarkan judul atau destinasi', async () => {
    const res = await call('GET', '/trips?q=samosir', { token: aliceToken });
    assert.equal(res.body.data.length, 1);
    const none = await call('GET', '/trips?q=bali', { token: aliceToken });
    assert.equal(none.body.data.length, 0);
  });

  test('pengguna lain tidak dapat melihat atau mengubah rencana ini (404)', async () => {
    const read = await call('GET', `/trips/${tripId}`, { token: bobToken });
    assert.equal(read.status, 404);
    const edit = await call('PUT', `/trips/${tripId}`, { token: bobToken, body: tripBody() });
    assert.equal(edit.status, 404);
    const list = await call('GET', '/trips', { token: bobToken });
    assert.equal(list.body.data.length, 0);
  });

  test('menghapus destinasi lalu rencana', async () => {
    const del = await call('DELETE', `/trips/${tripId}/stops/${day1StopIds[1]}`, { token: aliceToken });
    assert.equal(del.status, 200);
    assert.equal(del.body.data.stop_count, 2);

    const removed = await call('DELETE', `/trips/${tripId}`, { token: aliceToken });
    assert.equal(removed.status, 200);
    const gone = await call('GET', `/trips/${tripId}`, { token: aliceToken });
    assert.equal(gone.status, 404);
  });

  test('akses tanpa token ke rencana ditolak (401)', async () => {
    const res = await call('GET', '/trips');
    assert.equal(res.status, 401);
  });
});

test('rute tidak dikenal mengembalikan 404 dengan format error', async () => {
  const res = await call('GET', '/tidak-ada');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});
