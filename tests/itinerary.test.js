import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { haversineKm } from '../src/lib/geo.js';
import { addDaysIso, dayCount, estimateCosts, routeDistanceKm, sortByDistance, sortByTime } from '../src/lib/itinerary.js';

const stop = (id, lat, lng, extra = {}) => ({
  id, position: id, name: `S${id}`, category: 'wisata', lat, lng,
  arrival_time: null, cost: 0, duration_min: 60, ...extra,
});

describe('haversineKm', () => {
  test('Jakarta ke Bandung sekitar 120 km (garis lurus)', () => {
    const km = haversineKm({ lat: -6.2088, lng: 106.8456 }, { lat: -6.9175, lng: 107.6191 });
    assert.ok(km > 110 && km < 125, `jarak ${km.toFixed(1)} km di luar rentang`);
  });

  test('titik yang sama berjarak nol', () => {
    assert.equal(haversineKm({ lat: 2.6, lng: 98.8 }, { lat: 2.6, lng: 98.8 }), 0);
  });

  test('simetris', () => {
    const a = { lat: 2.55, lng: 98.9 };
    const b = { lat: 2.66, lng: 98.7 };
    assert.ok(Math.abs(haversineKm(a, b) - haversineKm(b, a)) < 1e-9);
  });
});

describe('tanggal', () => {
  test('dayCount bersifat inklusif', () => {
    assert.equal(dayCount('2026-10-01', '2026-10-01'), 1);
    assert.equal(dayCount('2026-10-01', '2026-10-05'), 5);
  });

  test('addDaysIso melewati akhir bulan', () => {
    assert.equal(addDaysIso('2026-10-30', 2), '2026-11-01');
  });
});

describe('urutan kunjungan', () => {
  test('sortByTime menaruh jam kedatangan lebih dulu dan tanpa jam di belakang', () => {
    const stops = [
      stop(1, 0, 0, { arrival_time: null }),
      stop(2, 0, 0, { arrival_time: '13:00' }),
      stop(3, 0, 0, { arrival_time: '08:30' }),
    ];
    assert.deepEqual(sortByTime(stops).map((s) => s.id), [3, 2, 1]);
  });

  test('sortByDistance mengurangi total jarak dibandingkan urutan awal', () => {
    // Titik berseling dari utara ke selatan; urutan awal sengaja acak
    const stops = [
      stop(1, 2.70, 98.90),
      stop(2, 2.50, 98.80),
      stop(3, 2.69, 98.91),
      stop(4, 2.51, 98.81),
    ];
    const before = routeDistanceKm(stops);
    const after = routeDistanceKm(sortByDistance(stops));
    assert.ok(after < before, `jarak setelah ${after} seharusnya < sebelum ${before}`);
    assert.equal(sortByDistance(stops)[0].id, 1, 'titik awal tetap destinasi pertama');
  });

  test('sortByDistance pada daftar kosong mengembalikan daftar kosong', () => {
    assert.deepEqual(sortByDistance([]), []);
  });
});

describe('estimasi biaya', () => {
  test('menjumlahkan biaya aktivitas dan transportasi, lalu menandai melebihi anggaran', () => {
    const days = [
      { day_number: 1, stops: [stop(1, 2.5, 98.8, { cost: 150000, category: 'wisata' }), stop(2, 2.6, 98.9, { cost: 75000, category: 'kuliner' })] },
      { day_number: 2, stops: [] },
    ];
    const { days: perDay, summary } = estimateCosts(days, { budget: 200000, ratePerKm: 1000 });

    assert.equal(summary.activity_cost, 225000);
    assert.equal(perDay[0].activity_cost, 225000);
    assert.equal(perDay[1].total_cost, 0);
    assert.equal(summary.transport_cost, Math.round(summary.distance_km * 1000));
    assert.equal(summary.total_cost, summary.activity_cost + summary.transport_cost);
    assert.equal(summary.over_budget, true);
    assert.equal(summary.remaining, 200000 - summary.total_cost);
    assert.deepEqual(summary.by_category, { wisata: 150000, kuliner: 75000 });
  });

  test('anggaran nol berarti tidak ada batas dan tidak pernah melebihi', () => {
    const { summary } = estimateCosts([{ day_number: 1, stops: [stop(1, 0, 0, { cost: 999999 })] }], { budget: 0, ratePerKm: 0 });
    assert.equal(summary.over_budget, false);
  });
});
