import { config } from '../config.js';
import { queryAll, queryOne } from '../db.js';
import { badRequest, notFound } from '../lib/errors.js';
import { addDaysIso, dayCount, estimateCosts, sortByDistance, sortByTime } from '../lib/itinerary.js';

const toStop = (row) => ({
  id: row.id,
  day_number: row.day_number,
  position: row.position,
  name: row.name,
  category: row.category,
  lat: row.lat,
  lng: row.lng,
  arrival_time: row.arrival_time,
  duration_min: row.duration_min,
  cost: row.cost,
  notes: row.notes,
});

const toTrip = (row) => ({
  id: row.id,
  title: row.title,
  destination: row.destination,
  start_date: row.start_date,
  end_date: row.end_date,
  budget: row.budget,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const groupByTrip = (rows) => {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.trip_id)) map.set(row.trip_id, []);
    map.get(row.trip_id).push(row);
  }
  return map;
};

/** Menyusun detail perjalanan: setiap hari (termasuk hari kosong), destinasi berurutan, dan estimasi biaya. */
function buildDetail(trip, stopRows) {
  const count = dayCount(trip.start_date, trip.end_date);
  const groups = Array.from({ length: count }, (_, index) => {
    const dayNumber = index + 1;
    return {
      day_number: dayNumber,
      date: addDaysIso(trip.start_date, index),
      stops: stopRows.filter((stop) => stop.day_number === dayNumber).map(toStop),
    };
  });

  const estimate = estimateCosts(groups, {
    budget: trip.budget,
    ratePerKm: config.transportRatePerKm,
  });

  return {
    ...toTrip(trip),
    day_count: count,
    stop_count: stopRows.length,
    days: groups.map((group, index) => ({ ...group, ...estimate.days[index] })),
    costs: estimate.summary,
  };
}

/** Layanan rencana perjalanan. Semua operasi dibatasi pada pemilik (user_id) agar data tidak bocor antarpengguna. */
export function createTripService(db) {
  const findTrip = async (userId, tripId) => {
    const row = await queryOne(db, 'SELECT * FROM trips WHERE id = ? AND user_id = ?', [tripId, userId]);
    if (!row) throw notFound('Rencana perjalanan tidak ditemukan');
    return row;
  };

  const stopsOfTrip = (tripId) => queryAll(
    db,
    'SELECT * FROM stops WHERE trip_id = ? ORDER BY day_number, position, id',
    [tripId],
  );

  const findOwnedStop = (userId, tripId, stopId) => queryOne(
    db,
    'SELECT s.* FROM stops s JOIN trips t ON t.id = s.trip_id WHERE s.id = ? AND s.trip_id = ? AND t.user_id = ?',
    [stopId, tripId, userId],
  );

  const nextPosition = async (tripId, dayNumber) => {
    const row = await queryOne(
      db,
      'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM stops WHERE trip_id = ? AND day_number = ?',
      [tripId, dayNumber],
    );
    return row.next;
  };

  const loadDetail = async (userId, tripId) => {
    const trip = await findTrip(userId, tripId);
    return buildDetail(trip, await stopsOfTrip(tripId));
  };

  const assertDayInRange = (trip, dayNumber) => {
    const count = dayCount(trip.start_date, trip.end_date);
    if (dayNumber > count) {
      throw badRequest('Hari berada di luar rentang perjalanan', {
        day_number: `Pilih hari 1 sampai ${count}`,
      });
    }
  };

  return {
    async list(userId, query = '') {
      const trips = query
        ? await queryAll(
          db,
          'SELECT * FROM trips WHERE user_id = ? AND (title LIKE ? OR destination LIKE ?) ORDER BY start_date ASC, id ASC',
          [userId, `%${query}%`, `%${query}%`],
        )
        : await queryAll(db, 'SELECT * FROM trips WHERE user_id = ? ORDER BY start_date ASC, id ASC', [userId]);
      const stops = await queryAll(
        db,
        'SELECT s.* FROM stops s JOIN trips t ON t.id = s.trip_id WHERE t.user_id = ? ORDER BY s.day_number, s.position, s.id',
        [userId],
      );
      const stopsByTrip = groupByTrip(stops);

      return trips.map((trip) => {
        const detail = buildDetail(trip, stopsByTrip.get(trip.id) || []);
        return {
          id: detail.id,
          title: detail.title,
          destination: detail.destination,
          start_date: detail.start_date,
          end_date: detail.end_date,
          budget: detail.budget,
          day_count: detail.day_count,
          stop_count: detail.stop_count,
          distance_km: detail.costs.distance_km,
          total_cost: detail.costs.total_cost,
          over_budget: detail.costs.over_budget,
        };
      });
    },

    get(userId, tripId) {
      return loadDetail(userId, tripId);
    },

    async create(userId, values) {
      const result = await db.execute({
        sql: 'INSERT INTO trips (user_id, title, destination, start_date, end_date, budget) VALUES (?, ?, ?, ?, ?, ?)',
        args: [userId, values.title, values.destination, values.start_date, values.end_date, values.budget],
      });
      return loadDetail(userId, Number(result.lastInsertRowid));
    },

    async update(userId, tripId, values) {
      await findTrip(userId, tripId);
      const count = dayCount(values.start_date, values.end_date);
      const outside = (await stopsOfTrip(tripId)).filter((stop) => stop.day_number > count);
      if (outside.length > 0) {
        const lastDay = Math.max(...outside.map((stop) => stop.day_number));
        throw badRequest(
          `Ada destinasi di hari ke-${lastDay}. Perpanjang rentang tanggal atau pindahkan destinasi tersebut terlebih dahulu.`,
          { end_date: `Rentang minimal ${lastDay} hari` },
        );
      }
      await db.execute({
        sql: "UPDATE trips SET title = ?, destination = ?, start_date = ?, end_date = ?, budget = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
        args: [values.title, values.destination, values.start_date, values.end_date, values.budget, tripId, userId],
      });
      return loadDetail(userId, tripId);
    },

    async remove(userId, tripId) {
      await findTrip(userId, tripId);
      // Hapus destinasi dulu, lalu rencananya, dalam satu transaksi (batch atomik).
      await db.batch([
        { sql: 'DELETE FROM stops WHERE trip_id = ?', args: [tripId] },
        { sql: 'DELETE FROM trips WHERE id = ? AND user_id = ?', args: [tripId, userId] },
      ], 'write');
      return { id: tripId, deleted: true };
    },

    async addStop(userId, tripId, values) {
      const trip = await findTrip(userId, tripId);
      assertDayInRange(trip, values.day_number);
      const position = await nextPosition(tripId, values.day_number);
      await db.execute({
        sql: 'INSERT INTO stops (trip_id, day_number, position, name, category, lat, lng, arrival_time, duration_min, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          tripId, values.day_number, position, values.name, values.category, values.lat, values.lng,
          values.arrival_time, values.duration_min, values.cost, values.notes,
        ],
      });
      return loadDetail(userId, tripId);
    },

    async updateStop(userId, tripId, stopId, values) {
      const trip = await findTrip(userId, tripId);
      const stop = await findOwnedStop(userId, tripId, stopId);
      if (!stop) throw notFound('Destinasi tidak ditemukan');
      assertDayInRange(trip, values.day_number);

      // Pindah hari: taruh di akhir hari tujuan. Tetap di hari yang sama: pertahankan posisinya.
      const position = values.day_number === stop.day_number
        ? stop.position
        : await nextPosition(tripId, values.day_number);

      await db.execute({
        sql: 'UPDATE stops SET day_number = ?, position = ?, name = ?, category = ?, lat = ?, lng = ?, arrival_time = ?, duration_min = ?, cost = ?, notes = ? WHERE id = ?',
        args: [
          values.day_number, position, values.name, values.category, values.lat, values.lng,
          values.arrival_time, values.duration_min, values.cost, values.notes, stopId,
        ],
      });
      return loadDetail(userId, tripId);
    },

    async removeStop(userId, tripId, stopId) {
      await findTrip(userId, tripId);
      const stop = await findOwnedStop(userId, tripId, stopId);
      if (!stop) throw notFound('Destinasi tidak ditemukan');
      await db.execute({ sql: 'DELETE FROM stops WHERE id = ?', args: [stopId] });
      return loadDetail(userId, tripId);
    },

    /** Menyusun ulang destinasi pada satu hari: 'time' (jam kedatangan) atau 'distance' (tetangga terdekat). */
    async reorder(userId, tripId, dayNumber, mode) {
      const trip = await findTrip(userId, tripId);
      assertDayInRange(trip, dayNumber);
      const stops = (await stopsOfTrip(tripId))
        .filter((stop) => stop.day_number === dayNumber)
        .map(toStop);
      const sorted = mode === 'time' ? sortByTime(stops) : sortByDistance(stops);

      if (sorted.length > 0) {
        await db.batch(
          sorted.map((stop, index) => ({
            sql: 'UPDATE stops SET position = ? WHERE id = ?',
            args: [index + 1, stop.id],
          })),
          'write',
        );
      }
      return loadDetail(userId, tripId);
    },
  };
}
