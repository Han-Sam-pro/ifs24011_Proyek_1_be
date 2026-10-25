import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TripPlan, Destination, DayPlan } from './types/trip';
import { PRESET_TRIPS } from './data/presetTrips';
import { decodeTripFromUrl } from './utils/share';
import { optimizeDayRoute } from './utils/geo';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PlannerPage } from './pages/PlannerPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { DestinationModal } from './components/DestinationModal';
import { ShareModal } from './components/ShareModal';
import { CitySelectorModal } from './components/CitySelectorModal';
import { AuthModal } from './components/AuthModal';
import { UsersDirectoryModal } from './components/UsersDirectoryModal';
import { PrintView } from './components/PrintView';
import {
  getProfile,
  getStoredUser,
  logoutUser,
  saveTrip,
  getUserTrips,
  AppUser,
} from './services/roamApi';

const STORAGE_KEY = 'roamplan_active_trip_v2';

export default function App() {
  const [trip, setTrip] = useState<TripPlan>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const encodedTrip = urlParams.get('trip');
      if (encodedTrip) {
        const decoded = decodeTripFromUrl(encodedTrip);
        if (decoded) return decoded;
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.days && parsed.days.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse saved trip', e);
    }
    return PRESET_TRIPS[0];
  });

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeViewTab, setActiveViewTab] = useState<'planner' | 'budget'>('planner');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);

  // Quota exceeded state from Google Maps listener
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Google Maps Platform API Key
  const googleMapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCEQN-kxO57116cJpanhq1_CvUENUSfbp4';

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Mobile layout sub-toggle between List and Map
  const [mobileSubTab, setMobileSubTab] = useState<'list' | 'map'>('list');

  // Modals state
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [destinationToEdit, setDestinationToEdit] = useState<Destination | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  // Auth User State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getStoredUser());

  useEffect(() => {
    // Verify token & profile with the RoamPlan API
    getProfile().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  const handleSyncTrip = async (currentTripToSync: TripPlan) => {
    if (!currentUser) return;
    const ok = await saveTrip(currentTripToSync);
    if (ok) {
      showToast('☁️ Itinerary berhasil tersimpan ke database RoamPlan!');
    }
  };

  const handleUserLoggedIn = async (user: AppUser) => {
    setCurrentUser(user);
    showToast(`Selamat datang kembali, ${user.name}!`);

    // Fetch user's saved trips from the database
    const userTrips = await getUserTrips();
    if (userTrips.length > 0) {
      setTrip(userTrips[0]);
      showToast(`☁️ Memuat rencana perjalanan ${userTrips[0].title} dari database`);
    } else {
      saveTrip(trip);
    }
  };

  const handleUserLoggedOut = () => {
    void logoutUser();
    setCurrentUser(null);
    showToast('Anda telah keluar dari akun RoamPlan');
    setIsAuthModalOpen(false);
  };

  const handleUpdateTripCity = (newCity: string) => {
    setTrip((prev) => {
      const updated = { ...prev, destinationCity: newCity };
      handleSyncTrip(updated);
      return updated;
    });
    showToast(`Kota tujuan berhasil diubah ke: ${newCity}`);
  };

  const handleCreateTripForCity = (newTrip: TripPlan) => {
    setTrip(newTrip);
    setActiveDayIndex(0);
    setSelectedDestinationId(null);
    handleSyncTrip(newTrip);
    showToast(`Berhasil membuat rencana perjalanan baru: ${newTrip.destinationCity}`);
  };

  // Location picking from map mode
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // URL Shared trip banner
  const [isSharedTripImported, setIsSharedTripImported] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('trip')) {
      setIsSharedTripImported(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch (e) {
      console.error('Failed to save trip to localStorage', e);
    }
  }, [trip]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const currentDay = trip.days[activeDayIndex] || trip.days[0];

  // Destination Actions
  const handleOpenAddDestination = () => {
    setDestinationToEdit(null);
    setPendingCoordinates(null);
    setIsDestModalOpen(true);
  };

  const handleOpenEditDestination = (dest: Destination) => {
    setDestinationToEdit(dest);
    setPendingCoordinates(null);
    setIsDestModalOpen(true);
  };

  const handleSaveDestination = (newOrUpdatedDest: Destination) => {
    setTrip((prev) => {
      const updatedDays = prev.days.map((day, idx) => {
        if (idx !== activeDayIndex) return day;

        const exists = day.destinations.some((d) => d.id === newOrUpdatedDest.id);
        const newDestinations = exists
          ? day.destinations.map((d) => (d.id === newOrUpdatedDest.id ? newOrUpdatedDest : d))
          : [...day.destinations, newOrUpdatedDest];

        return {
          ...day,
          destinations: newDestinations,
        };
      });

      return { ...prev, days: updatedDays };
    });

    showToast(destinationToEdit ? 'Destinasi berhasil diperbarui' : 'Destinasi berhasil ditambahkan');
    setIsPickingLocation(false);
  };

  const handleDeleteDestination = (destId: string) => {
    setTrip((prev) => {
      const updatedDays = prev.days.map((day, idx) => {
        if (idx !== activeDayIndex) return day;
        return {
          ...day,
          destinations: day.destinations.filter((d) => d.id !== destId),
        };
      });
      return { ...prev, days: updatedDays };
    });
    if (selectedDestinationId === destId) {
      setSelectedDestinationId(null);
    }
    showToast('Destinasi dihapus dari jadwal');
  };

  const handleMoveDestination = (index: number, direction: 'up' | 'down') => {
    setTrip((prev) => {
      const updatedDays = prev.days.map((day, idx) => {
        if (idx !== activeDayIndex) return day;

        const list = [...day.destinations];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= list.length) return day;

        const temp = list[index];
        list[index] = list[targetIndex];
        list[targetIndex] = temp;

        return { ...day, destinations: list };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Smart Route Optimizer
  const handleOptimizeRoute = () => {
    if (!currentDay || currentDay.destinations.length < 3) return;

    const { optimizedDestinations, distanceSavedKm, timeSavedMinutes } = optimizeDayRoute(
      currentDay.destinations
    );

    setTrip((prev) => {
      const updatedDays = prev.days.map((day, idx) => {
        if (idx !== activeDayIndex) return day;
        return {
          ...day,
          destinations: optimizedDestinations,
        };
      });
      return { ...prev, days: updatedDays };
    });

    if (distanceSavedKm > 0 || timeSavedMinutes > 0) {
      showToast(
        `⚡ Rute berhasil dioptimalkan! Menghemat ${distanceSavedKm} km dan ~${timeSavedMinutes} menit perjalanan.`
      );
    } else {
      showToast('⚡ Urutan rute saat ini sudah merupakan jalur paling optimal.');
    }
  };

  // Day Management
  const handleAddDay = () => {
    const newDayNum = trip.days.length + 1;
    let nextDate = new Date().toISOString().split('T')[0];
    if (trip.days.length > 0) {
      const lastDate = new Date(trip.days[trip.days.length - 1].date);
      if (!isNaN(lastDate.getTime())) {
        lastDate.setDate(lastDate.getDate() + 1);
        nextDate = lastDate.toISOString().split('T')[0];
      }
    }

    const newDay: DayPlan = {
      id: `day-${Date.now()}`,
      dayNumber: newDayNum,
      date: nextDate,
      themeTitle: `Eksplorasi Hari ke-${newDayNum}`,
      destinations: [],
    };

    setTrip((prev) => ({
      ...prev,
      days: [...prev.days, newDay],
    }));

    setActiveDayIndex(trip.days.length);
    showToast(`Hari ${newDayNum} berhasil ditambahkan`);
  };

  const handleDeleteDay = (dayId: string) => {
    if (trip.days.length <= 1) return;

    setTrip((prev) => {
      const filtered = prev.days.filter((d) => d.id !== dayId);
      const renumbered = filtered.map((d, i) => ({
        ...d,
        dayNumber: i + 1,
      }));
      return { ...prev, days: renumbered };
    });

    setActiveDayIndex(0);
    showToast('Hari berhasil dihapus');
  };

  const handleUpdateDayTheme = (dayId: string, themeTitle: string, date: string) => {
    setTrip((prev) => {
      const updated = prev.days.map((d) => (d.id === dayId ? { ...d, themeTitle, date } : d));
      return { ...prev, days: updated };
    });
    showToast('Informasi hari berhasil diperbarui');
  };

  // Map coordinate picking workflow
  const handleTriggerMapPick = () => {
    setIsDestModalOpen(false);
    setIsPickingLocation(true);
    setMobileSubTab('map');
    showToast('Klik pada Google Maps untuk menentukan lokasi destinasi');
  };

  const handlePickLocationFromMap = (lat: number, lng: number) => {
    setPendingCoordinates({ lat, lng });
    setIsPickingLocation(false);
    setIsDestModalOpen(true);
    showToast(`Koordinat dipilih: ${lat}, ${lng}`);
  };

  const handleUpdateTotalBudget = (newBudget: number) => {
    setTrip((prev) => ({ ...prev, totalBudget: newBudget }));
    showToast('Batas anggaran berhasil diperbarui');
  };

  const handleChangeCurrency = (currency: TripPlan['currency']) => {
    setTrip((prev) => ({ ...prev, currency }));
    showToast(`Mata uang diganti ke ${currency}`);
  };

  const handleSelectPresetTrip = (preset: TripPlan) => {
    setTrip(preset);
    setActiveDayIndex(0);
    setSelectedDestinationId(null);
    showToast(`Memuat template: ${preset.title}`);
  };

  const handleNewTrip = () => {
    const freshTrip: TripPlan = {
      id: `trip-${Date.now()}`,
      title: 'Perjalanan Baru Tanpa Judul',
      destinationCity: 'Destinasi Liburan',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      currency: 'IDR',
      totalBudget: 5000000,
      days: [
        {
          id: `day-1-${Date.now()}`,
          dayNumber: 1,
          date: new Date().toISOString().split('T')[0],
          themeTitle: 'Hari Pertama Kedatangan',
          destinations: [],
        },
      ],
    };
    setTrip(freshTrip);
    setActiveDayIndex(0);
    setSelectedDestinationId(null);
    showToast('Membuat rencana perjalanan baru');
  };

  const handleImportTrip = (imported: TripPlan) => {
    setTrip(imported);
    setActiveDayIndex(0);
    setSelectedDestinationId(null);
    showToast(`Berhasil mengimpor: ${imported.title}`);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const plannerProps = {
    trip,
    setTrip,
    activeDayIndex,
    setActiveDayIndex,
    activeViewTab,
    setActiveViewTab,
    selectedDestinationId,
    setSelectedDestinationId,
    quotaExceeded,
    googleMapsApiKey,
    mobileSubTab,
    setMobileSubTab,
    currentUser,
    isSharedTripImported,
    setIsSharedTripImported,
    toastMessage,
    onOpenAddDestination: handleOpenAddDestination,
    onOpenEditDestination: handleOpenEditDestination,
    handleDeleteDestination,
    handleMoveDestination,
    handleOptimizeRoute,
    handleAddDay,
    handleDeleteDay,
    handleUpdateDayTheme,
    handleUpdateTotalBudget,
    handleChangeCurrency,
    handleSelectPresetTrip,
    handleNewTrip,
    handleTriggerPrint,
    setIsShareModalOpen,
    setIsCityModalOpen,
    setIsAuthModalOpen,
    setIsUsersModalOpen,
    isPickingLocation,
    handlePickLocationFromMap,
  };

  const headerCommonProps = {
    trip,
    currentUser,
    onOpenShareModal: () => setIsShareModalOpen(true),
    onTriggerPrint: handleTriggerPrint,
    onSelectPresetTrip: handleSelectPresetTrip,
    onChangeCurrency: handleChangeCurrency,
    onNewTrip: handleNewTrip,
    onOpenCityModal: () => setIsCityModalOpen(true),
    onOpenAuthModal: () => setIsAuthModalOpen(true),
    onOpenUsersModal: () => setIsUsersModalOpen(true),
  };

  return (
    <BrowserRouter>
      {/* Printable View */}
      <PrintView trip={trip} />

      <Routes>
        {/* Public Unprotected Auth Routes */}
        <Route
          path="/auth/login"
          element={
            <LoginPage
              onLoginSuccess={() => {
                getProfile().then((u) => u && handleUserLoggedIn(u));
              }}
            />
          }
        />
        <Route
          path="/atuh/login"
          element={
            <LoginPage
              onLoginSuccess={() => {
                getProfile().then((u) => u && handleUserLoggedIn(u));
              }}
            />
          }
        />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/atuh/register" element={<RegisterPage />} />

        {/* Protected Routes (Require Login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<PlannerPage {...plannerProps} />} />
          <Route path="/plan/:id" element={<PlannerPage {...plannerProps} />} />
          <Route path="/users" element={<UsersPage {...headerCommonProps} />} />
          <Route path="/users/" element={<UsersPage {...headerCommonProps} />} />
          <Route
            path="/profile"
            element={<ProfilePage {...headerCommonProps} onUserLoggedOut={handleUserLoggedOut} />}
          />
          <Route
            path="/profile/"
            element={<ProfilePage {...headerCommonProps} onUserLoggedOut={handleUserLoggedOut} />}
          />
        </Route>

        {/* Catch-all Wildcard Route -> Redirect to Root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Shared Modals */}
      <DestinationModal
        isOpen={isDestModalOpen}
        onClose={() => {
          setIsDestModalOpen(false);
          setIsPickingLocation(false);
        }}
        onSave={handleSaveDestination}
        destinationToEdit={destinationToEdit}
        dayNumber={currentDay?.dayNumber || 1}
        currency={trip.currency}
        destinationCity={trip.destinationCity}
        onTriggerMapPick={handleTriggerMapPick}
        pendingCoordinates={pendingCoordinates}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trip={trip}
        onImportTrip={handleImportTrip}
        onTriggerPrint={handleTriggerPrint}
      />

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentTrip={trip}
        onUpdateTripCity={handleUpdateTripCity}
        onCreateTripForCity={handleCreateTripForCity}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserLoggedIn={handleUserLoggedIn}
        onUserLoggedOut={handleUserLoggedOut}
      />

      <UsersDirectoryModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />
    </BrowserRouter>
  );
}
