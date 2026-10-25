/** Format respons sukses seragam: { success, data, meta? }. */
export function ok(res, data, { status = 200, meta = null } = {}) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}
