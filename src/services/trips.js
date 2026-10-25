import { config } from '../config.js';
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
      stops: stopRows
        .filter((stop) => stop.day_number === dayNumber)
        .map(toStop),
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
  const stmt = {
    tripsByUser: db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY start_date ASC, id ASC'),
    tripsByUserSearch: db.prepare(
      'SELECT * FROM trips WHERE user_id = ? AND (title LIKE ? OR destination LIKE ?) ORDER BY start_date ASC, id ASC',
    ),
    stopsByUser: db.prepare(
      'SELECT s.* FROM stops s JOIN trips t ON t.id = s.trip_id WHERE t.user_id = ? ORDER BY s.day_number, s.position, s.id',
    ),
    tripOwned: db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?'),
    stopsByTrip: db.prepare('SELECT * FROM stops WHERE trip_id = ? ORDER BY day_number, position, id'),
    insertTrip: db.prepare(
      'INSERT INTO trips (user_id, title, destination, start_date, end_date, budget) VALUES (?, ?, ?, ?, ?, ?)',
    ),
    updateTrip: db.prepare(
      "UPDATE trips SET title = ?, destination = ?, start_date = ?, end_date = ?, budget = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
    ),
    deleteTrip: db.prepare('DELETE FROM trips WHERE id = ? AND user_id = ?'),
    nextPosition: db.prepare(
      'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM stops WHERE trip_id = ? AND day_number = ?',
    ),
    insertStop: db.prepare(
      'INSERT INTO stops (trip_id, day_number, position, name, category, lat, lng, arrival_time, duration_min, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ),
    stopOwned: db.prepare(
      'SELECT s.* FROM stops s JOIN trips t ON t.id = s.trip_id WHERE s.id = ? AND s.trip_id = ? AND t.user_id = ?',
    ),
    updateStop: db.prepare(
      'UPDATE stops SET day_number = ?, position = ?, name = ?, category = ?, lat = ?, lng = ?, arrival_time = ?, duration_min = ?, cost = ?, notes = ? WHERE id = ?',
    ),
    deleteStop: db.prepare('DELETE FROM stops WHERE id = ?'),
    updatePosition: db.prepare('UPDATE stops SET position = ? WHERE id = ?'),
  };

  const findTrip = (userId, tripId) => {
    const row = stmt.tripOwned.get(tripId, userId);
    if (!row) throw notFound('Rencana perjalanan tidak ditemukan');
    return row;
  };

  const loadDetail = (userId, tripId) => {
    const trip = findTrip(userId, tripId);
    return buildDetail(trip, stmt.stopsByTrip.all(tripId));
  };

  const assertDayInRange = (trip, dayNumber) => {
    const count = dayCount(trip.start_date, trip.end_date);
    if (dayNumber > count) {
      throw badRequest('Hari berada di luar rentang perjalanan', {
        day_number: `Pilih hari 1 sampai ${count}`,
      });
    }
  };

  const transaction = (fn) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };

  return {
    list(userId, query = '') {
      const trips = query
        ? stmt.tripsByUserSearch.all(userId, `%${query}%`, `%${query}%`)
        : stmt.tripsByUser.all(userId);
      const stopsByTrip = groupByTrip(stmt.stopsByUser.all(userId));

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

    create(userId, values) {
      const result = stmt.insertTrip.run(
        userId,
        values.title,
        values.destination,
        values.start_date,
        values.end_date,
        values.budget,
      );
      return loadDetail(userId, Number(result.lastInsertRowid));
    },

    update(userId, tripId, values) {
      findTrip(userId, tripId);
      const count = dayCount(values.start_date, values.end_date);
      const outside = stmt.stopsByTrip.all(tripId).filter((stop) => stop.day_number > count);
      if (outside.length > 0) {
        const lastDay = Math.max(...outside.map((stop) => stop.day_number));
        throw badRequest(
          `Ada destinasi di hari ke-${lastDay}. Perpanjang rentang tanggal atau pindahkan destinasi tersebut terlebih dahulu.`,
          { end_date: `Rentang minimal ${lastDay} hari` },
        );
      }
      stmt.updateTrip.run(
        values.title,
        values.destination,
        values.start_date,
        values.end_date,
        values.budget,
        tripId,
        userId,
      );
      return loadDetail(userId, tripId);
    },

    remove(userId, tripId) {
      findTrip(userId, tripId);
      stmt.deleteTrip.run(tripId, userId);
      return { id: tripId, deleted: true };
    },

    addStop(userId, tripId, values) {
      const trip = findTrip(userId, tripId);
      assertDayInRange(trip, values.day_number);
      const { next } = stmt.nextPosition.get(tripId, values.day_number);
      stmt.insertStop.run(
        tripId,
        values.day_number,
        next,
        values.name,
        values.category,
        values.lat,
        values.lng,
        values.arrival_time,
        values.duration_min,
        values.cost,
        values.notes,
      );
      return loadDetail(userId, tripId);
    },

    updateStop(userId, tripId, stopId, values) {
      const trip = findTrip(userId, tripId);
      const stop = stmt.stopOwned.get(stopId, tripId, userId);
      if (!stop) throw notFound('Destinasi tidak ditemukan');
      assertDayInRange(trip, values.day_number);

      // Pindah hari: taruh di akhir hari tujuan. Tetap di hari yang sama: pertahankan posisinya.
      const position = values.day_number === stop.day_number
        ? stop.position
        : stmt.nextPosition.get(tripId, values.day_number).next;

      stmt.updateStop.run(
        values.day_number,
        position,
        values.name,
        values.category,
        values.lat,
        values.lng,
        values.arrival_time,
        values.duration_min,
        values.cost,
        values.notes,
        stopId,
      );
      return loadDetail(userId, tripId);
    },

    removeStop(userId, tripId, stopId) {
      findTrip(userId, tripId);
      const stop = stmt.stopOwned.get(stopId, tripId, userId);
      if (!stop) throw notFound('Destinasi tidak ditemukan');
      stmt.deleteStop.run(stopId);
      return loadDetail(userId, tripId);
    },

    /** Menyusun ulang destinasi pada satu hari: 'time' (jam kedatangan) atau 'distance' (tetangga terdekat). */
    reorder(userId, tripId, dayNumber, mode) {
      const trip = findTrip(userId, tripId);
      assertDayInRange(trip, dayNumber);
      const stops = stmt.stopsByTrip.all(tripId)
        .filter((stop) => stop.day_number === dayNumber)
        .map(toStop);
      const sorted = mode === 'time' ? sortByTime(stops) : sortByDistance(stops);

      transaction(() => {
        sorted.forEach((stop, index) => stmt.updatePosition.run(index + 1, stop.id));
      });
      return loadDetail(userId, tripId);
    },
  };
}
