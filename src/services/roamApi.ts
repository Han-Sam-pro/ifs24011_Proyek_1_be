import { TripPlan } from '../types/trip';

// Semua permintaan diarahkan ke backend RoamPlan sendiri (Express + SQLite).
const BASE_URL = '/api';

export const DEFAULT_AVATAR = '/default-avatar.svg';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  status: 'success' | 'fail';
  message: string;
  data?: {
    user: AppUser;
    token: string;
  };
}

export interface UsersListResponse {
  status: 'success' | 'fail';
  data?: {
    users: AppUser[];
  };
}

const TOKEN_KEY = 'roamplan_auth_token';
const USER_KEY = 'roamplan_user';

// Token helpers (disimpan di localStorage browser)
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): AppUser | null => {
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, user: AppUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// API Calls
export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await res.json();
  } catch (e: unknown) {
    return {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Gagal menghubungi server pendaftaran',
    };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data: AuthResponse = await res.json();
    if (data.status === 'success' && data.data) {
      setAuthSession(data.data.token, data.data.user);
    }
    return data;
  } catch (e: unknown) {
    return {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Gagal menghubungi server autentikasi',
    };
  }
}

// Menghapus sesi di server lalu membersihkan localStorage
export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  clearAuthSession();
  if (token) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: authHeaders(token),
      });
    } catch (e) {
      console.error('Gagal menghapus sesi di server', e);
    }
  }
}

export async function getProfile(): Promise<AppUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}/users/me`, {
      method: 'GET',
      headers: authHeaders(token),
    });
    const data = await res.json();
    if (data.status === 'success' && data.data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
      return data.data.user;
    }
  } catch (e) {
    console.error('Gagal mengambil profil pengguna', e);
  }
  return null;
}

export async function getUsersList(): Promise<AppUser[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'GET',
      headers: authHeaders(token),
    });
    const data: UsersListResponse = await res.json();
    if (data.status === 'success' && data.data?.users) {
      return data.data.users;
    }
  } catch (e) {
    console.error('Gagal mengambil daftar pengguna', e);
  }
  return [];
}

// Menyimpan (membuat/memperbarui) itinerary milik user yang sedang login
export async function saveTrip(trip: TripPlan): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;

  try {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(trip),
    });
    const data = await res.json();
    return data.status === 'success';
  } catch (e) {
    console.error('Gagal menyimpan itinerary ke database', e);
    return false;
  }
}

// Mengambil seluruh itinerary milik user yang sedang login
export async function getUserTrips(): Promise<TripPlan[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'GET',
      headers: authHeaders(token),
    });
    const data = await res.json();
    if (data.status === 'success' && Array.isArray(data.data?.trips)) {
      return data.data.trips as TripPlan[];
    }
  } catch (e) {
    console.error('Gagal mengambil itinerary dari database', e);
  }
  return [];
}
