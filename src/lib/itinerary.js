import { haversineKm } from './geo.js';

const DAY_MS = 86400000;

/** Jumlah hari dalam rentang tanggal inklusif (YYYY-MM-DD). */
export function dayCount(startDate, endDate) {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / DAY_MS) + 1;
}

/** Tanggal YYYY-MM-DD setelah `days` hari dari `date`. */
export function addDaysIso(date, days) {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Urutan berdasarkan jam kedatangan (kosong di belakang), lalu posisi manual. */
export function sortByTime(stops) {
  return [...stops].sort((a, b) => {
    if (a.arrival_time && b.arrival_time) {
      return a.arrival_time.localeCompare(b.arrival_time) || a.position - b.position;
    }
    if (a.arrival_time) return -1;
    if (b.arrival_time) return 1;
    return a.position - b.position;
  });
}

/**
 * Urutan berdasarkan jarak memakai heuristik tetangga terdekat (nearest neighbour).
 * Titik awal adalah destinasi pertama menurut posisi saat ini.
 */
export function sortByDistance(stops) {
  if (stops.length === 0) return [];
  const remaining = [...stops];
  const ordered = [remaining.shift()];
  while (remaining.length > 0) {
    const last = ordered.at(-1);
    let nearest = 0;
    let nearestKm = Infinity;
    remaining.forEach((stop, index) => {
      const km = haversineKm(last, stop);
      if (km < nearestKm) {
        nearestKm = km;
        nearest = index;
      }
    });
    ordered.push(remaining.splice(nearest, 1)[0]);
  }
  return ordered;
}

/** Total jarak kumulatif (km) antar destinasi berurutan. */
export function routeDistanceKm(stops) {
  let total = 0;
  for (let i = 1; i < stops.length; i += 1) total += haversineKm(stops[i - 1], stops[i]);
  return total;
}

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Estimasi biaya per hari dan total perjalanan.
 * Biaya transportasi = jarak rute harian (km) x tarif per km. Biaya aktivitas = jumlah biaya tiap destinasi.
 * @param {{ day_number: number, stops: object[] }[]} dayGroups stops sudah berurutan
 */
export function estimateCosts(dayGroups, { budget = 0, ratePerKm = 0 } = {}) {
  const byCategory = {};
  let activityCost = 0;
  let transportCost = 0;
  let distanceKm = 0;

  const days = dayGroups.map(({ stops }) => {
    const dayActivity = stops.reduce((sum, stop) => sum + stop.cost, 0);
    const dayDistance = round2(routeDistanceKm(stops));
    const dayTransport = Math.round(dayDistance * ratePerKm);

    for (const stop of stops) {
      byCategory[stop.category] = (byCategory[stop.category] || 0) + stop.cost;
    }
    activityCost += dayActivity;
    transportCost += dayTransport;
    distanceKm += dayDistance;

    return {
      stop_count: stops.length,
      distance_km: dayDistance,
      activity_cost: dayActivity,
      transport_cost: dayTransport,
      total_cost: dayActivity + dayTransport,
    };
  });

  const totalCost = activityCost + transportCost;
  return {
    days,
    summary: {
      activity_cost: activityCost,
      transport_cost: transportCost,
      total_cost: totalCost,
      distance_km: round2(distanceKm),
      budget,
      remaining: budget - totalCost,
      over_budget: budget > 0 && totalCost > budget,
      by_category: byCategory,
    },
  };
}
