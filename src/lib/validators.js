export const MAX_TRIP_DAYS = 30;
export const TRIP_CATEGORIES = ['wisata', 'kuliner', 'transportasi', 'penginapan', 'lainnya'];
export const TRIP_ORDER_MODES = ['time', 'distance'];

const USERNAME_RE = /^[A-Za-z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?\d[\d\s-]{6,18}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return Number.NaN;
};
const orDefault = (value, fallback) => (value === undefined || value === '' || value === null ? fallback : value);

export const isRealDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const daysBetween = (start, end) => Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;

function passwordError(password) {
  if (password.length < 8 || password.length > 72) return 'Kata sandi harus 8-72 karakter';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Kata sandi harus mengandung huruf dan angka';
  return '';
}

export function validateRegister(body = {}) {
  const errors = {};
  const values = {
    name: text(body.name),
    username: text(body.username),
    email: text(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  if (values.name.length < 3 || values.name.length > 100) errors.name = 'Nama harus 3-100 karakter';
  if (!USERNAME_RE.test(values.username)) errors.username = 'Username 3-30 karakter: huruf, angka, atau garis bawah';
  if (!EMAIL_RE.test(values.email) || values.email.length > 254) errors.email = 'Format email tidak valid';
  const pwError = passwordError(values.password);
  if (pwError) errors.password = pwError;
  return { errors, values };
}

export function validateLogin(body = {}) {
  const errors = {};
  const values = { username: text(body.username), password: typeof body.password === 'string' ? body.password : '' };
  if (!values.username) errors.username = 'Username wajib diisi';
  if (!values.password) errors.password = 'Kata sandi wajib diisi';
  return { errors, values };
}

export function validateProfile(body = {}) {
  const errors = {};
  const values = {
    name: text(body.name),
    email: text(body.email).toLowerCase(),
    phone: text(body.phone) || null,
    bio: text(body.bio) || null,
  };
  if (values.name.length < 3 || values.name.length > 100) errors.name = 'Nama harus 3-100 karakter';
  if (!EMAIL_RE.test(values.email) || values.email.length > 254) errors.email = 'Format email tidak valid';
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = 'Nomor telepon tidak valid';
  if (values.bio && values.bio.length > 300) errors.bio = 'Bio maksimal 300 karakter';
  return { errors, values };
}

export function validatePasswordChange(body = {}) {
  const errors = {};
  const values = {
    current_password: typeof body.current_password === 'string' ? body.current_password : '',
    new_password: typeof body.new_password === 'string' ? body.new_password : '',
  };
  if (!values.current_password) errors.current_password = 'Kata sandi saat ini wajib diisi';
  const pwError = passwordError(values.new_password);
  if (pwError) errors.new_password = pwError;
  else if (values.new_password === values.current_password) errors.new_password = 'Kata sandi baru harus berbeda';
  return { errors, values };
}

export function validateTrip(body = {}) {
  const errors = {};
  const values = {
    title: text(body.title),
    destination: text(body.destination),
    start_date: text(body.start_date),
    end_date: text(body.end_date),
    budget: toNumber(orDefault(body.budget, 0)),
  };
  if (values.title.length < 3 || values.title.length > 100) errors.title = 'Judul rencana harus 3-100 karakter';
  if (values.destination.length < 2 || values.destination.length > 120) errors.destination = 'Destinasi harus 2-120 karakter';
  if (!isRealDate(values.start_date)) errors.start_date = 'Tanggal mulai tidak valid';
  if (!isRealDate(values.end_date)) {
    errors.end_date = 'Tanggal selesai tidak valid';
  } else if (isRealDate(values.start_date)) {
    if (values.end_date < values.start_date) {
      errors.end_date = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
    } else if (daysBetween(values.start_date, values.end_date) > MAX_TRIP_DAYS) {
      errors.end_date = `Durasi perjalanan maksimal ${MAX_TRIP_DAYS} hari`;
    }
  }
  if (!Number.isInteger(values.budget) || values.budget < 0 || values.budget > 1e9) {
    errors.budget = 'Anggaran harus bilangan bulat 0 - 1.000.000.000';
  }
  return { errors, values };
}

export function validateStop(body = {}) {
  const errors = {};
  const arrival = text(body.arrival_time);
  const notes = text(body.notes);
  const values = {
    day_number: toNumber(body.day_number),
    name: text(body.name),
    category: text(orDefault(body.category, 'wisata')),
    lat: toNumber(body.lat),
    lng: toNumber(body.lng),
    arrival_time: arrival || null,
    duration_min: toNumber(orDefault(body.duration_min, 60)),
    cost: toNumber(orDefault(body.cost, 0)),
    notes: notes || null,
  };
  if (!Number.isInteger(values.day_number) || values.day_number < 1) errors.day_number = 'Hari harus bilangan bulat minimal 1';
  if (values.name.length < 2 || values.name.length > 120) errors.name = 'Nama destinasi harus 2-120 karakter';
  if (!TRIP_CATEGORIES.includes(values.category)) errors.category = 'Kategori tidak valid';
  if (!Number.isFinite(values.lat) || values.lat < -90 || values.lat > 90) errors.lat = 'Latitude harus -90 sampai 90';
  if (!Number.isFinite(values.lng) || values.lng < -180 || values.lng > 180) errors.lng = 'Longitude harus -180 sampai 180';
  if (arrival && !TIME_RE.test(arrival)) errors.arrival_time = 'Format jam harus HH:MM';
  if (!Number.isInteger(values.duration_min) || values.duration_min < 0 || values.duration_min > 1440) {
    errors.duration_min = 'Durasi harus 0-1440 menit';
  }
  if (!Number.isInteger(values.cost) || values.cost < 0 || values.cost > 1e9) {
    errors.cost = 'Biaya harus bilangan bulat 0 - 1.000.000.000';
  }
  if (notes.length > 500) errors.notes = 'Catatan maksimal 500 karakter';
  return { errors, values };
}
