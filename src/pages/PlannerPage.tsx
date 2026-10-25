import React from 'react';
import { useParams } from 'react-router-dom';
import { TripPlan, Destination, DayPlan } from '../types/trip';
import { AppUser } from '../services/roamApi';
import { Header } from '../components/Header';
import { DayTabs } from '../components/DayTabs';
import { ItineraryView } from '../components/ItineraryView';
import { GoogleMapView } from '../components/GoogleMapView';
import { BudgetOverview } from '../components/BudgetOverview';
import { MapPin, Sparkles, Info, Map as MapIcon, ListOrdered, Globe } from 'lucide-react';

interface PlannerPageProps {
  trip: TripPlan;
  setTrip: React.Dispatch<React.SetStateAction<TripPlan>>;
  activeDayIndex: number;
  setActiveDayIndex: (idx: number) => void;
  activeViewTab: 'planner' | 'budget';
  setActiveViewTab: (tab: 'planner' | 'budget') => void;
  selectedDestinationId: string | null;
  setSelectedDestinationId: (id: string | null) => void;
  quotaExceeded: boolean;
  googleMapsApiKey: string;
  mobileSubTab: 'list' | 'map';
  setMobileSubTab: (tab: 'list' | 'map') => void;
  currentUser: AppUser | null;
  isSharedTripImported: boolean;
  setIsSharedTripImported: (val: boolean) => void;
  toastMessage: string | null;
  onOpenAddDestination: () => void;
  onOpenEditDestination: (dest: Destination) => void;
  handleDeleteDestination: (destId: string) => void;
  handleMoveDestination: (index: number, direction: 'up' | 'down') => void;
  handleOptimizeRoute: () => void;
  handleAddDay: () => void;
  handleDeleteDay: (dayId: string) => void;
  handleUpdateDayTheme: (dayId: string, themeTitle: string, date: string) => void;
  handleUpdateTotalBudget: (newBudget: number) => void;
  handleChangeCurrency: (currency: TripPlan['currency']) => void;
  handleSelectPresetTrip: (preset: TripPlan) => void;
  handleNewTrip: () => void;
  handleTriggerPrint: () => void;
  setIsShareModalOpen: (val: boolean) => void;
  setIsCityModalOpen: (val: boolean) => void;
  setIsAuthModalOpen: (val: boolean) => void;
  setIsUsersModalOpen: (val: boolean) => void;
  isPickingLocation: boolean;
  handlePickLocationFromMap: (lat: number, lng: number) => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = (props) => {
  const { id } = useParams<{ id?: string }>();
  const currentDay = props.trip.days[props.activeDayIndex] || props.trip.days[0];

  return (
    <div className="no-print flex flex-col flex-1 min-h-screen bg-[#fdfaf6]">
      {/* Header Contract */}
      <Header
        trip={props.trip}
        activeViewTab={props.activeViewTab}
        currentUser={props.currentUser}
        onChangeViewTab={props.setActiveViewTab}
        onOpenShareModal={() => props.setIsShareModalOpen(true)}
        onTriggerPrint={props.handleTriggerPrint}
        onSelectPresetTrip={props.handleSelectPresetTrip}
        onChangeCurrency={props.handleChangeCurrency}
        onNewTrip={props.handleNewTrip}
        onOpenCityModal={() => props.setIsCityModalOpen(true)}
        onOpenAuthModal={() => props.setIsAuthModalOpen(true)}
        onOpenUsersModal={() => props.setIsUsersModalOpen(true)}
      />

      {/* Google Maps Quota Exceeded Sticky Notice */}
      {props.quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-amber-950 hover:text-orange-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Shared URL Trip Banner */}
      {props.isSharedTripImported && (
        <div className="bg-orange-50/80 border-b border-orange-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-orange-950">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                <strong>Mode Berbagi Teman:</strong> Anda sedang melihat rencana perjalanan bersama <em>"{props.trip.title}"</em>.
              </span>
            </div>
            <button
              onClick={() => props.setIsSharedTripImported(false)}
              className="text-orange-700 hover:text-orange-900 font-bold shrink-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {props.toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900/95 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-orange-700/60">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>{props.toastMessage}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4">
        {/* Trip Hero Bar */}
        <div className="bg-white rounded-xl border border-orange-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={props.trip.title}
                onChange={(e) => props.setTrip({ ...props.trip, title: e.target.value })}
                style={{ width: `${Math.max(props.trip.title.length + 2, 12)}ch` }}
                className="text-base sm:text-lg font-bold text-stone-900 bg-transparent border-b border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none max-w-full transition-all"
                title="Klik untuk mengubah judul rencana perjalanan"
                aria-label="Judul rencana perjalanan"
              />
            </div>
            {/* Interactive City Badge & Metadata Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono">
              <button
                type="button"
                onClick={() => props.setIsCityModalOpen(true)}
                title="Klik untuk ganti atau tambah kota tujuan"
                aria-label={`Ganti kota tujuan saat ini (${props.trip.destinationCity})`}
                className="flex items-center gap-1.5 text-stone-800 font-semibold bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200 transition-colors cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-orange-600" />
                <span>{props.trip.destinationCity}</span>
                <span className="text-[10px] text-orange-700 underline font-normal ml-0.5">(Ganti)</span>
              </button>
              <span aria-hidden="true" className="text-orange-200">·</span>
              <span>{props.trip.days.length} Hari Perjalanan</span>
              <span aria-hidden="true" className="text-orange-200">·</span>
              <span>
                {props.trip.days.reduce((acc, d) => acc + d.destinations.length, 0)} Total Tempat
              </span>
              {id && (
                <>
                  <span aria-hidden="true" className="text-orange-200">·</span>
                  <span className="text-orange-800 font-bold">ID: #{id}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => props.setIsCityModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-orange-950 bg-orange-100/90 hover:bg-orange-200 rounded-lg border border-orange-300/80 transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
              <span>+ Ganti / Tambah Kota</span>
            </button>
            <button
              onClick={props.handleNewTrip}
              className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-orange-900 hover:bg-orange-50 rounded-lg border border-orange-200 transition-colors"
            >
              Rencana Baru
            </button>
          </div>
        </div>

        {/* Tab 1: Planner (Itinerary & Google Maps) */}
        {props.activeViewTab === 'planner' && (
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Day Navigation Tabs */}
            <DayTabs
              days={props.trip.days}
              activeDayIndex={props.activeDayIndex}
              onSelectDay={(idx) => {
                props.setActiveDayIndex(idx);
                props.setSelectedDestinationId(null);
              }}
              onAddDay={props.handleAddDay}
              onDeleteDay={props.handleDeleteDay}
              onUpdateDayTheme={props.handleUpdateDayTheme}
            />

            {/* Mobile Sub-Tab Switcher (List vs Map) */}
            <div className="flex sm:hidden items-center justify-center bg-stone-200/90 p-1 rounded-lg">
              <button
                onClick={() => props.setMobileSubTab('list')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  props.mobileSubTab === 'list'
                    ? 'bg-white text-orange-950 shadow-2xs font-bold'
                    : 'text-stone-600'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Jadwal Hari {currentDay.dayNumber}</span>
              </button>
              <button
                onClick={() => props.setMobileSubTab('map')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  props.mobileSubTab === 'map'
                    ? 'bg-white text-orange-950 shadow-2xs font-bold'
                    : 'text-stone-600'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-orange-600" />
                <span>Google Maps</span>
              </button>
            </div>

            {/* 50/50 Dual Column Split on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[560px]">
              {/* Left Column: Itinerary Timeline List */}
              <div
                className={`lg:col-span-6 xl:col-span-5 h-[560px] lg:h-full flex flex-col ${
                  props.mobileSubTab === 'list' ? 'block' : 'hidden lg:flex'
                }`}
              >
                <ItineraryView
                  currentDay={currentDay}
                  currency={props.trip.currency}
                  selectedDestinationId={props.selectedDestinationId}
                  onSelectDestination={props.setSelectedDestinationId}
                  onAddDestination={props.onOpenAddDestination}
                  onEditDestination={props.onOpenEditDestination}
                  onDeleteDestination={props.handleDeleteDestination}
                  onMoveDestination={props.handleMoveDestination}
                  onOptimizeRoute={props.handleOptimizeRoute}
                />
              </div>

              {/* Right Column: Google Maps Canvas */}
              <div
                className={`lg:col-span-6 xl:col-span-7 h-[500px] lg:h-full min-h-[400px] flex flex-col ${
                  props.mobileSubTab === 'map' ? 'block' : 'hidden lg:flex'
                }`}
              >
                <div className="flex-1 w-full h-full min-h-0">
                  <GoogleMapView
                    apiKey={props.googleMapsApiKey}
                    currentDay={currentDay}
                    selectedDestinationId={props.selectedDestinationId}
                    onSelectDestination={props.setSelectedDestinationId}
                    currency={props.trip.currency}
                    destinationCity={props.trip.destinationCity}
                    isPickingLocation={props.isPickingLocation}
                    onPickLocation={props.handlePickLocationFromMap}
                    onEditDestination={props.onOpenEditDestination}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Budget Management */}
        {props.activeViewTab === 'budget' && (
          <div className="flex-1">
            <BudgetOverview
              trip={props.trip}
              onUpdateTotalBudget={props.handleUpdateTotalBudget}
            />
          </div>
        )}
      </main>
    </div>
  );
};
