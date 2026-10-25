import React, { useState } from 'react';
import { DayPlan } from '../types/trip';
import { Plus, Calendar, Edit3, Trash2, Check, X } from 'lucide-react';

interface DayTabsProps {
  days: DayPlan[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
  onAddDay: () => void;
  onDeleteDay: (dayId: string) => void;
  onUpdateDayTheme: (dayId: string, themeTitle: string, date: string) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({
  days,
  activeDayIndex,
  onSelectDay,
  onAddDay,
  onDeleteDay,
  onUpdateDayTheme,
}) => {
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [themeInput, setThemeInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  const activeDay = days[activeDayIndex] || days[0];

  const handleStartEditing = (day: DayPlan) => {
    setEditingDayId(day.id);
    setThemeInput(day.themeTitle || '');
    setDateInput(day.date);
  };

  const handleSaveEditing = (dayId: string) => {
    onUpdateDayTheme(dayId, themeInput.trim(), dateInput);
    setEditingDayId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-orange-200/80 p-2 shadow-2xs">
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Days Tab List */}
        <div className="flex items-center gap-1.5 min-w-0">
          {days.map((day, idx) => {
            const isActive = idx === activeDayIndex;
            return (
              <button
                key={day.id}
                onClick={() => onSelectDay(idx)}
                aria-label={`Pilih Hari ke ${day.dayNumber}, berisi ${day.destinations.length} destinasi`}
                aria-pressed={isActive}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-orange-900 hover:bg-orange-50/70 bg-transparent'
                }`}
              >
                <span>Hari {day.dayNumber}</span>
                <span
                  className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-orange-700 text-orange-100' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {day.destinations.length}
                </span>
              </button>
            );
          })}

          {/* Add Day Button */}
          <button
            onClick={onAddDay}
            aria-label="Tambah hari baru ke itinerary"
            className="px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
            title="Tambah hari baru ke itinerary"
          >
            <Plus className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
            <span className="hidden sm:inline">Hari Baru</span>
          </button>
        </div>

        {/* Current Day Metadata & Edit Controls */}
        {activeDay && (
          <div className="flex items-center gap-2 pl-2 border-l border-orange-200/70 shrink-0">
            {editingDayId === activeDay.id ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <input
                  type="text"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder="Tema hari (Wisata Candi, Kuliner...)"
                  aria-label="Judul tema hari"
                  style={{ width: `${Math.max(themeInput.length + 2, 16)}ch` }}
                  className="px-2 py-1 text-xs border border-orange-300 rounded font-normal max-w-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  autoFocus
                />
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  aria-label="Tanggal hari perjalanan"
                  className="px-2 py-1 text-xs border border-orange-300 rounded font-normal focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => handleSaveEditing(activeDay.id)}
                  aria-label="Simpan perubahan tema dan tanggal hari ini"
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  title="Simpan"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDayId(null)}
                  aria-label="Batal edit tema dan tanggal hari ini"
                  className="p-1 text-stone-500 hover:bg-stone-100 rounded"
                  title="Batal"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <div className="hidden md:flex items-center gap-1.5 text-stone-600">
                  <Calendar className="w-3 h-3 text-orange-500" aria-hidden="true" />
                  <span className="font-mono">{activeDay.date}</span>
                  {activeDay.themeTitle && (
                    <>
                      <span className="text-orange-300">·</span>
                      <span className="text-stone-800 font-medium whitespace-normal">
                        {activeDay.themeTitle}
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleStartEditing(activeDay)}
                  aria-label="Edit judul tema atau tanggal hari ini"
                  className="p-1 text-stone-500 hover:text-orange-700 rounded hover:bg-orange-50 transition-colors"
                  title="Edit judul tema atau tanggal hari ini"
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        activeDay.destinations.length === 0 ||
                        window.confirm(`Hapus Hari ${activeDay.dayNumber}? Seluruh destinasi di hari ini akan terhapus.`)
                      ) {
                        onDeleteDay(activeDay.id);
                      }
                    }}
                    aria-label={`Hapus Hari ${activeDay.dayNumber}`}
                    className="p-1 text-stone-500 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Hapus hari ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
