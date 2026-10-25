import React, { useState } from 'react';
import { TripPlan } from '../types/trip';
import { generateShareUrl, exportTripToJsonFile } from '../utils/share';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  Link,
  Printer,
  FileText,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripPlan;
  onImportTrip: (importedTrip: TripPlan) => void;
  onTriggerPrint: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  trip,
  onImportTrip,
  onTriggerPrint,
}) => {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareUrl = generateShareUrl(trip);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      const input = document.getElementById('share-url-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as TripPlan;
        if (parsed && parsed.days && Array.isArray(parsed.days)) {
          onImportTrip(parsed);
          onClose();
        } else {
          setImportError('Format berkas tidak valid untuk RoamPlan.');
        }
      } catch (err) {
        setImportError('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-orange-200/90 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-orange-50/40">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-orange-600" aria-hidden="true" />
            <div>
              <h2 id="share-modal-title" className="text-base font-bold text-stone-900">
                Bagikan Itinerary ke Rekan Perjalanan
              </h2>
              <p className="text-xs text-stone-600">
                Teman perjalanan dapat membuka dan menyalin itinerary secara instan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela bagikan itinerary"
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Share Link Box */}
          <div className="space-y-2">
            <label htmlFor="share-url-input" className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
              <span>Tautan Berbagi Langsung (URL)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-orange-50/30 border border-orange-200 rounded-lg text-stone-800 select-all focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label="Salin tautan itinerary ke clipboard"
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Salin Tautan</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              *Tautan ini memuat seluruh data destinasi, jadwal waktu, peta Google Maps, dan estimasi anggaran tanpa perlu login.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Print / PDF Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => onTriggerPrint(), 100);
              }}
              aria-label="Buka pratinjau cetak dan PDF itinerary"
              className="p-3 text-left rounded-lg border border-orange-200/80 hover:border-orange-300 bg-orange-50/20 hover:bg-orange-50/60 transition-colors flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <div className="p-2 rounded-md bg-white border border-orange-200 shadow-2xs text-orange-700">
                <Printer className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">
                  Cetak / Simpan PDF
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Format lembar panduan rapi editorial
                </div>
              </div>
            </button>

            {/* Export JSON */}
            <button
              type="button"
              onClick={() => exportTripToJsonFile(trip)}
              aria-label="Unduh salinan data perjalanan dalam format berkas JSON"
              className="p-3 text-left rounded-lg border border-orange-200/80 hover:border-orange-300 bg-orange-50/20 hover:bg-orange-50/60 transition-colors flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <div className="p-2 rounded-md bg-white border border-orange-200 shadow-2xs text-orange-700">
                <Download className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">
                  Unduh Berkas JSON
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Cadangkan data perjalanan Anda
                </div>
              </div>
            </button>
          </div>

          {/* Import JSON Section */}
          <div className="pt-3 border-t border-orange-100">
            <div className="flex items-center justify-between">
              <label htmlFor="json-upload-file" className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                <span>Impor Jadwal dari Berkas JSON:</span>
                <input
                  id="json-upload-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="text-xs text-orange-700 hover:underline font-bold ml-1">
                  Pilih Berkas
                </span>
              </label>
            </div>
            {importError && (
              <p className="text-xs text-rose-600 mt-1" role="alert">{importError}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
