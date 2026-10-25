import React, { useState } from 'react';
import { TripPlan, DestinationCategory } from '../types/trip';
import { formatCurrency } from '../utils/geo';
import {
  Wallet,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Check,
} from 'lucide-react';

interface BudgetOverviewProps {
  trip: TripPlan;
  onUpdateTotalBudget: (newBudget: number) => void;
}

const CATEGORY_NAMES: Record<DestinationCategory, string> = {
  hotel: 'Akomodasi & Hotel',
  culinary: 'Kuliner & Cafe',
  sightseeing: 'Tiket Wisata & Budaya',
  nature: 'Atraksi Alam & Terbuka',
  shopping: 'Belanja & Oleh-Oleh',
  transit: 'Transportasi & Logistik',
};

const CATEGORY_COLORS: Record<DestinationCategory, string> = {
  hotel: 'bg-amber-500',
  culinary: 'bg-orange-600',
  sightseeing: 'bg-orange-500',
  nature: 'bg-emerald-600',
  shopping: 'bg-rose-500',
  transit: 'bg-stone-500',
};

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  trip,
  onUpdateTotalBudget,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(trip.totalBudget.toString());

  // Aggregate expenses
  let totalEstimatedCost = 0;
  const categoryTotals: Record<DestinationCategory, number> = {
    sightseeing: 0,
    culinary: 0,
    hotel: 0,
    shopping: 0,
    nature: 0,
    transit: 0,
  };

  const dayTotals: { dayNumber: number; total: number; count: number }[] = [];

  trip.days.forEach((day) => {
    let daySum = 0;
    day.destinations.forEach((dest) => {
      totalEstimatedCost += dest.cost;
      daySum += dest.cost;
      categoryTotals[dest.category] = (categoryTotals[dest.category] || 0) + dest.cost;
    });
    dayTotals.push({
      dayNumber: day.dayNumber,
      total: daySum,
      count: day.destinations.length,
    });
  });

  const remainingBudget = trip.totalBudget - totalEstimatedCost;
  const percentageSpent = trip.totalBudget > 0 ? (totalEstimatedCost / trip.totalBudget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;
  const isNearBudget = percentageSpent >= 80 && !isOverBudget;

  const handleSaveBudget = () => {
    const val = Number(budgetInput) || 0;
    onUpdateTotalBudget(val);
    setIsEditingBudget(false);
  };

  return (
    <div className="bg-white rounded-xl border border-orange-200/80 p-5 space-y-6 shadow-2xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-orange-100 pb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-600" />
          <h3 className="text-sm font-bold text-stone-900">
            Estimasi & Pengendalian Anggaran
          </h3>
        </div>
        <div className="text-xs text-stone-500 font-mono">
          Mata Uang: <strong className="text-orange-950 font-bold">{trip.currency}</strong>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Target Budget */}
        <div className="p-3.5 rounded-lg border border-orange-200/70 bg-orange-50/30">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Target Anggaran</span>
            {isEditingBudget ? (
              <button
                type="button"
                onClick={handleSaveBudget}
                aria-label="Simpan batas target anggaran"
                className="text-orange-700 hover:text-orange-900 flex items-center gap-0.5 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" /> Simpan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setBudgetInput(trip.totalBudget.toString());
                  setIsEditingBudget(true);
                }}
                className="text-stone-500 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded p-0.5"
                title="Ubah batas anggaran"
                aria-label="Ubah batas anggaran"
              >
                <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          {isEditingBudget ? (
            <input
              type="number"
              step="50000"
              aria-label="Target batas total anggaran"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full mt-1 px-2 py-1 text-sm font-mono font-bold border border-orange-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          ) : (
            <div className="text-lg font-bold text-stone-900 font-mono tabular-nums mt-1">
              {formatCurrency(trip.totalBudget, trip.currency)}
            </div>
          )}
          <div className="text-[11px] text-stone-500 mt-0.5">
            Batas pengeluaran trip
          </div>
        </div>

        {/* Total Estimated Cost */}
        <div className="p-3.5 rounded-lg border border-orange-200/70 bg-orange-50/30">
          <div className="text-xs text-stone-500">Total Estimasi Terpakai</div>
          <div className="text-lg font-bold text-stone-900 font-mono tabular-nums mt-1">
            {formatCurrency(totalEstimatedCost, trip.currency)}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5 font-mono tabular-nums">
            {percentageSpent.toFixed(1)}% dari total bujet
          </div>
        </div>

        {/* Remaining Budget */}
        <div
          className={`p-3.5 rounded-lg border ${
            isOverBudget
              ? 'border-rose-200 bg-rose-50/50'
              : isNearBudget
              ? 'border-amber-200 bg-amber-50/50'
              : 'border-emerald-200 bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={
                isOverBudget
                  ? 'text-rose-700 font-semibold'
                  : isNearBudget
                  ? 'text-amber-800 font-semibold'
                  : 'text-emerald-700 font-semibold'
              }
            >
              {isOverBudget ? 'Defisit Anggaran' : 'Sisa Anggaran'}
            </span>
            {isOverBudget ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div
            className={`text-lg font-bold font-mono tabular-nums mt-1 ${
              isOverBudget
                ? 'text-rose-700'
                : isNearBudget
                ? 'text-amber-800'
                : 'text-emerald-700'
            }`}
          >
            {formatCurrency(Math.abs(remainingBudget), trip.currency)}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            {isOverBudget
              ? 'Melebihi target anggaran yang ditentukan'
              : 'Masih dalam batas aman bujet'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-stone-600 font-mono tabular-nums">
          <span>Penggunaan Bujet</span>
          <span className="font-bold text-orange-900">{percentageSpent.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2.5 bg-orange-100/70 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, percentageSpent)}%` }}
            className={`h-full transition-all duration-300 rounded-full ${
              isOverBudget
                ? 'bg-rose-500'
                : isNearBudget
                ? 'bg-amber-500'
                : 'bg-orange-600'
            }`}
          />
        </div>
      </div>

      {/* Category Expense Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
          Distribusi Pengeluaran Berdasarkan Kategori
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(Object.keys(categoryTotals) as DestinationCategory[]).map((cat) => {
            const amount = categoryTotals[cat];
            const catPercent = totalEstimatedCost > 0 ? (amount / totalEstimatedCost) * 100 : 0;

            return (
              <div
                key={cat}
                className="p-2.5 rounded-lg border border-orange-100 hover:border-orange-200 bg-orange-50/20 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-800 font-medium">{CATEGORY_NAMES[cat]}</span>
                  <span className="font-mono tabular-nums font-semibold text-stone-900">
                    {formatCurrency(amount, trip.currency)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${catPercent}%` }}
                      className={`h-full ${CATEGORY_COLORS[cat]} rounded-full`}
                    />
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-stone-400 w-10 text-right">
                    {catPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="space-y-2 border-t border-orange-100 pt-4">
        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
          Rincian Biaya Per Hari
        </h4>
        <div className="divide-y divide-orange-100/70 text-xs">
          {dayTotals.map((d) => (
            <div key={d.dayNumber} className="py-2 flex items-center justify-between">
              <span className="text-stone-600">
                Hari {d.dayNumber} ({d.count} destinasi)
              </span>
              <span className="font-mono tabular-nums font-semibold text-stone-900">
                {formatCurrency(d.total, trip.currency)}
              </span>
            </div>
          ))}
          <div className="py-2.5 flex items-center justify-between font-bold border-t border-orange-200">
            <span className="text-stone-900">Rata-rata Biaya Per Hari</span>
            <span className="font-mono tabular-nums text-orange-950 font-bold">
              {formatCurrency(
                dayTotals.length > 0 ? Math.round(totalEstimatedCost / dayTotals.length) : 0,
                trip.currency
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
