import React from 'react';
import { TripPlan } from '../types/trip';
import { formatCurrency, formatDuration, calculateDayRouteStats } from '../utils/geo';
import { Compass, Calendar, MapPin, Clock } from 'lucide-react';

interface PrintViewProps {
  trip: TripPlan;
}

export const PrintView: React.FC<PrintViewProps> = ({ trip }) => {
  const totalCost = trip.days.reduce(
    (acc, day) => acc + day.destinations.reduce((dAcc, d) => dAcc + d.cost, 0),
    0
  );

  return (
    <div className="hidden print:block p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans">
      {/* Editorial Header */}
      <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            <Compass className="w-4 h-4" />
            <span>RoamPlan Travel Brief</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {trip.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-mono">
            <span>Destinasi: {trip.destinationCity}</span>
            <span>·</span>
            <span>Periode: {trip.startDate} s/d {trip.endDate}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase">Total Estimasi Anggaran</div>
          <div className="text-xl font-bold font-mono">
            {formatCurrency(totalCost, trip.currency)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Target Bujet: {formatCurrency(trip.totalBudget, trip.currency)}
          </div>
        </div>
      </div>

      {/* Days Iteration */}
      <div className="space-y-8">
        {trip.days.map((day) => {
          const stats = calculateDayRouteStats(day.destinations);
          const dayCost = day.destinations.reduce((sum, d) => sum + d.cost, 0);

          return (
            <div key={day.id} className="border border-slate-200 rounded-lg p-5 break-inside-avoid">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Hari {day.dayNumber}: {day.themeTitle || 'Rencana Perjalanan'}
                  </h2>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Tanggal: {day.date} · {day.destinations.length} Tempat Kunjungan
                  </div>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="font-semibold text-slate-800">
                    {stats.totalDistanceKm} km · ~{stats.totalTravelMinutes} mnt di jalan
                  </div>
                  <div className="text-slate-500">
                    Biaya Hari: {formatCurrency(dayCost, trip.currency)}
                  </div>
                </div>
              </div>

              {/* Table of Destinations */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono">
                    <th className="py-2 w-10">No</th>
                    <th className="py-2 w-20">Waktu</th>
                    <th className="py-2">Nama Destinasi & Lokasi</th>
                    <th className="py-2 w-24">Durasi</th>
                    <th className="py-2 w-28 text-right">Estimasi Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {day.destinations.map((dest, idx) => (
                    <tr key={dest.id} className="py-2">
                      <td className="py-2.5 font-bold font-mono">{idx + 1}</td>
                      <td className="py-2.5 font-mono text-slate-600">{dest.startTime}</td>
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900">{dest.title}</div>
                        {dest.address && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{dest.address}</div>
                        )}
                        {dest.notes && (
                          <div className="text-[11px] italic text-slate-600 mt-0.5">
                            Catatan: {dest.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-slate-600">
                        {formatDuration(dest.durationMinutes)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(dest.cost, trip.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400 font-mono">
        Dicetak otomatis melalui RoamPlan — Smart Trip Planner · {new Date().toLocaleDateString('id-ID')}
      </div>
    </div>
  );
};
