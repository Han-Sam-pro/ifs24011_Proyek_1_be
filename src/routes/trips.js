import { Router } from 'express';
import { badRequest, notFound } from '../lib/errors.js';
import { ok } from '../lib/response.js';
import { TRIP_ORDER_MODES, validateStop, validateTrip } from '../lib/validators.js';
import { createTripService } from '../services/trips.js';

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw notFound();
  return id;
};

const requireValid = ({ errors, values }) => {
  if (Object.keys(errors).length > 0) throw badRequest('Data tidak valid', errors);
  return values;
};

export function tripRoutes({ db, requireAuth }) {
  const router = Router();
  const service = createTripService(db);
  router.use(requireAuth);

  router.get('/', (req, res) => {
    const query = String(req.query.q ?? '').trim().slice(0, 100);
    ok(res, service.list(req.user.id, query));
  });

  router.post('/', (req, res) => {
    ok(res, service.create(req.user.id, requireValid(validateTrip(req.body))), { status: 201 });
  });

  router.get('/:id', (req, res) => {
    ok(res, service.get(req.user.id, parseId(req.params.id)));
  });

  router.put('/:id', (req, res) => {
    ok(res, service.update(req.user.id, parseId(req.params.id), requireValid(validateTrip(req.body))));
  });

  router.delete('/:id', (req, res) => {
    ok(res, service.remove(req.user.id, parseId(req.params.id)));
  });

  router.post('/:id/stops', (req, res) => {
    const values = requireValid(validateStop(req.body));
    ok(res, service.addStop(req.user.id, parseId(req.params.id), values), { status: 201 });
  });

  router.put('/:id/stops/:stopId', (req, res) => {
    const values = requireValid(validateStop(req.body));
    ok(res, service.updateStop(req.user.id, parseId(req.params.id), parseId(req.params.stopId), values));
  });

  router.delete('/:id/stops/:stopId', (req, res) => {
    ok(res, service.removeStop(req.user.id, parseId(req.params.id), parseId(req.params.stopId)));
  });

  router.post('/:id/days/:day/reorder', (req, res) => {
    const mode = req.body?.mode;
    if (!TRIP_ORDER_MODES.includes(mode)) {
      throw badRequest('Mode urutan tidak valid', { mode: "Pilih 'time' atau 'distance'" });
    }
    ok(res, service.reorder(req.user.id, parseId(req.params.id), parseId(req.params.day), mode));
  });

  return router;
}
