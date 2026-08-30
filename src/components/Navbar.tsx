'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Shuffle,
  Undo2,
  Redo2,
  Tv,
  Download,
  FileImage,
  FileText,
  FileSpreadsheet,
  Printer,
  Sparkles,
  HelpCircle,
  Armchair,
  ChevronDown,
  Glasses,
} from 'lucide-react';
import { ClassroomConfig } from '../types/seating';

interface NavbarProps {
  config: ClassroomConfig;
  stats: {
    totalSeats: number;
    totalStudents: number;
    occupiedSeats: number;
    emptySeats: number;
    pinnedCount: number;
    minusCount: number;
  };
  canUndo: boolean;
  canRedo: boolean;
  isShuffling: boolean;
  onShuffle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenPresentation: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onOpenShortcuts: () => void;
}

export function Navbar({
  config,
  stats,
  canUndo,
  canRedo,
  isShuffling,
  onShuffle,
  onUndo,
  onRedo,
  onOpenPresentation,
  onExportPng,
  onExportPdf,
  onExportCsv,
  onPrint,
  onOpenShortcuts,
}: NavbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full max-w-full h-16 bg-white/95 backdrop-blur-md border-b-2 border-blue-100 px-3 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Brand & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-amber-300 flex items-center justify-center shadow-md shadow-blue-500/20 border-2 border-blue-500 shrink-0">
          <Armchair className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-black tracking-tight text-blue-950 truncate">
              DENAHKU
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 shrink-0 hidden xs:inline-block">
              {config.arrangement === '2-2' ? '2-2 Gandeng' : '1-1 Mandiri'}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate max-w-[100px] sm:max-w-xs">
            {config.title || 'Penata Kelas'}
          </span>
        </div>
      </div>

      {/* Middle Stats Badges */}
      <div className="hidden md:flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-semibold">
          <span className="font-mono font-bold text-blue-700">
            {stats.occupiedSeats} / {stats.totalSeats}
          </span>
          <span>Kursi Terisi</span>
        </div>

        {stats.minusCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold">
            <Glasses className="w-3.5 h-3.5 text-red-600" />
            <span>{stats.minusCount} Minus</span>
          </div>
        )}

        {stats.emptySeats > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
            <span>{stats.emptySeats} Kosong</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Urungkan perubahan (⌘Z)"
            className="p-1 sm:p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
          >
            <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Ulangi perubahan (⌘⇧Z)"
            className="p-1 sm:p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
          >
            <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Shortcuts Info */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          title="Panduan Tombol Pintas"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors hidden sm:flex"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Mode Proyektor */}
        <button
          type="button"
          onClick={onOpenPresentation}
          title="Mode Proyektor Layar Penuh"
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-700 transition-all shadow-2xs"
        >
          <Tv className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Proyektor</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setExportOpen((prev) => !prev)}
            title="Ekspor Denah"
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-700 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Ekspor</span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60" />
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 py-1.5 z-50 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  onExportPng();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <FileImage className="w-4 h-4 text-blue-600" />
                <span>Simpan Gambar PNG (HD)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  onExportPdf();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Unduh Dokumen PDF (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  onExportCsv();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Ekspor Tabel Excel/CSV</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  onPrint();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak Denah (⌘P)</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Shuffle Button (Vibrant Blue + Yellow) */}
        <button
          type="button"
          onClick={onShuffle}
          disabled={isShuffling || stats.totalStudents === 0}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shuffle
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 transition-transform duration-500 ${
              isShuffling ? 'rotate-180 scale-125' : ''
            }`}
          />
          <span className="font-extrabold tracking-wide">Acak</span>
          <span className="hidden md:inline text-[10px] bg-white/20 text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
            Spasi
          </span>
        </button>
      </div>
    </header>
  );
}
