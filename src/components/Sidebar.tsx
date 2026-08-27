'use client';

import React, { useState } from 'react';
import {
  Users,
  Grid,
  Settings,
  ArrowDownAZ,
  ArrowDown10,
  Trash2,
  BookOpen,
  LayoutGrid,
  Columns2,
  Plus,
  Minus,
  CheckCircle2,
  Info,
  Glasses,
  Sparkles,
  Hash,
  Wand2,
  Star,
} from 'lucide-react';
import { ClassroomConfig, DeskArrangement, EmptySeatStrategy } from '../types/seating';
import { PRESET_ROSTERS } from '../utils/presets';

interface SidebarProps {
  studentsText: string;
  onStudentsTextChange: (text: string) => void;
  config: ClassroomConfig;
  onConfigChange: (updates: Partial<ClassroomConfig>) => void;
  onArrangementChange: (arr: DeskArrangement) => void;
  onDimensionsChange: (rows: number, cols: number) => void;
  onLoadPreset: (presetId: string) => void;
  onGenerateAbsenFromCount: (count: number, priorityListStr: string) => void;
  onGenerateAbsenOnly: (count: number) => void;
  onTogglePriority: (absenNo: number) => void;
  onSetPriorityListStr: (str: string) => void;
  priorityAbsenSet: Set<number>;
  onClearRoster: () => void;
  onAlphabetize: () => void;
  onSortByAbsen: () => void;
  onAddExampleMinus: () => void;
  stats: {
    totalSeats: number;
    totalStudents: number;
    occupiedSeats: number;
    emptySeats: number;
    pinnedCount: number;
    priorityCount: number;
    minusCount: number;
    pairsCount: number;
  };
}

export function Sidebar({
  studentsText,
  onStudentsTextChange,
  config,
  onConfigChange,
  onArrangementChange,
  onDimensionsChange,
  onLoadPreset,
  onGenerateAbsenFromCount,
  onGenerateAbsenOnly,
  onTogglePriority,
  onSetPriorityListStr,
  priorityAbsenSet,
  onClearRoster,
  onAlphabetize,
  onSortByAbsen,
  onAddExampleMinus,
  stats,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'layout' | 'info'>('roster');

  const [customCount, setCustomCount] = useState<number>(stats.totalStudents || 36);
  const [customPriorityStr, setCustomPriorityStr] = useState<string>('17, 20, 22, 28, 31, 36');

  const { rows, cols, arrangement, emptyStrategy, frontPosition, prioritizeMinusInFront } = config;

  return (
    <aside className="w-full lg:w-96 flex flex-col bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 h-auto lg:h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Top Segmented Tab Navigation */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70">
        <div className="grid grid-cols-3 p-1 bg-slate-200/90 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Absen</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-extrabold shrink-0 ${
              activeTab === 'roster' ? 'bg-blue-800 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {stats.totalStudents}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'layout'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100/50'
            }`}
          >
            <Grid className="w-3.5 h-3.5 shrink-0" />
            <span>Tata Letak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>Info Kelas</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Daftar Siswa & Input Absen */}
      {activeTab === 'roster' && (
        <div className="p-4 flex flex-col gap-4">
          {/* Fitur Otomatis Isi Absen dari Jumlah Murid Saja */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-blue-100/50 border-2 border-blue-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Wand2 className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-blue-950">Isi Absen Otomatis (Jumlah Murid)</h3>
                <p className="text-[10px] text-blue-800 font-semibold">Tinggal tentukan jumlah murid & nomor prioritas</p>
              </div>
            </div>

            {/* Stepper Jumlah Murid */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>Total Jumlah Murid</span>
                <span className="font-mono text-blue-700 font-extrabold text-xs">{customCount} Murid</span>
              </label>
              <div className="flex items-center justify-between p-1 bg-white rounded-2xl border-2 border-blue-200 shadow-2xs">
                <button
                  type="button"
                  disabled={customCount <= 2}
                  onClick={() => setCustomCount((prev) => Math.max(2, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-100 text-blue-900 flex items-center justify-center font-bold disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={customCount}
                  onChange={(e) => setCustomCount(parseInt(e.target.value, 10) || 1)}
                  className="w-20 text-center font-mono font-extrabold text-blue-950 text-sm focus:outline-none"
                />

                <button
                  type="button"
                  disabled={customCount >= 60}
                  onClick={() => setCustomCount((prev) => Math.min(60, prev + 1))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-100 text-blue-900 flex items-center justify-center font-bold disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Input Nomor Absen Prioritas Depan */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>Nomor Absen Prioritas Depan</span>
                <span className="text-[10px] text-red-600 font-bold">Wajib Baris 1</span>
              </label>
              <input
                type="text"
                value={customPriorityStr}
                onChange={(e) => setCustomPriorityStr(e.target.value)}
                placeholder="Contoh: 1, 4, 9, 15"
                className="w-full p-2 text-xs font-mono font-semibold rounded-xl border border-blue-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Tombol Buat & Terapkan */}
            <button
              type="button"
              onClick={() => onGenerateAbsenFromCount(customCount, customPriorityStr)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Terapkan Absen 1 s/d {customCount}</span>
            </button>
          </div>

          {/* Interactive Priority Chips Selector (Klik Nomor untuk Tandai Prioritas Depan) */}
          {stats.totalStudents > 0 && (
            <div className="p-3.5 rounded-3xl bg-red-50/70 border-2 border-red-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-red-600 fill-red-600" />
                  <span>Pilih Cepat Absen Prioritas Depan</span>
                </label>
                <span className="text-[11px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  {stats.priorityCount} Terpilih
                </span>
              </div>
              <p className="text-[10px] text-red-700 leading-tight">
                Klik nomor absen di bawah untuk menyalakan/mematikan prioritas baris depan:
              </p>

              <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 bg-white rounded-2xl border border-red-200">
                {Array.from({ length: Math.min(stats.totalStudents, 60) }).map((_, idx) => {
                  const absenNum = idx + 1;
                  const isPriority = priorityAbsenSet.has(absenNum);

                  return (
                    <button
                      key={`p-chip-${absenNum}`}
                      type="button"
                      onClick={() => onTogglePriority(absenNum)}
                      title={`Klik untuk ${isPriority ? 'hapus' : 'jadikan'} prioritas baris depan`}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-extrabold transition-all flex items-center justify-center ${
                        isPriority
                          ? 'bg-red-600 text-white shadow-xs scale-105 ring-2 ring-red-300'
                          : 'bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700'
                      }`}
                    >
                      {absenNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Template Kelas Default */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Template Default Kelas
              </span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_ROSTERS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onLoadPreset(preset.id)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-left text-xs font-bold text-blue-950 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{preset.name}</span>
                  </div>
                  <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md font-bold">
                    Hartitik, S.Pd
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Roster Text Area */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Daftar Nomor Absen Kelas
              </label>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {stats.totalStudents} Nomor Absen
              </span>
            </div>
            <textarea
              value={studentsText}
              onChange={(e) => onStudentsTextChange(e.target.value)}
              placeholder="Absen 1&#10;Absen 2&#10;Absen 3&#10;..."
              rows={8}
              className="w-full p-3 font-mono text-xs font-semibold rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Quick Roster Utilities & Sorters */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onSortByAbsen}
              title="Urutkan berdasarkan nomor absen 1, 2, 3..."
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-xs font-extrabold text-blue-900 transition-all shadow-2xs"
            >
              <ArrowDown10 className="w-4 h-4 text-blue-600" />
              <span>Urut No. Absen (1, 2, 3... 36)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onAddExampleMinus}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-all shadow-2xs"
              >
                <Glasses className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Tag [Prioritas]</span>
              </button>

              <button
                type="button"
                onClick={onClearRoster}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 transition-all shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Kosongkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tata Letak & Konfigurasi Meja */}
      {activeTab === 'layout' && (
        <div className="p-4 flex flex-col gap-5">
          {/* Desk Arrangement Mode (1-1 vs 2-2) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-800">
              Pilihan Susunan Meja Kelas
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => onArrangementChange('1-1')}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                  arrangement === '1-1'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                <LayoutGrid className={`w-5 h-5 ${arrangement === '1-1' ? 'text-amber-300' : 'text-blue-600'}`} />
                <span>1-1 Meja Mandiri</span>
                <span className={`text-[10px] text-center font-normal ${arrangement === '1-1' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Meja tunggal terpisah rata
                </span>
              </button>

              <button
                type="button"
                onClick={() => onArrangementChange('2-2')}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                  arrangement === '2-2'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                <Columns2 className={`w-5 h-5 ${arrangement === '2-2' ? 'text-amber-300' : 'text-blue-600'}`} />
                <span>2-2 Meja Gandeng</span>
                <span className={`text-[10px] text-center font-normal ${arrangement === '2-2' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Meja berdua + lorong jalan
                </span>
              </button>
            </div>
          </div>

          {/* Posisi Meja Guru (Pojok Kiri Atas) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <div>
                <h4 className="text-xs font-extrabold text-amber-950">Posisi Meja Guru</h4>
                <p className="text-[10px] text-amber-800 font-semibold">Diletakkan di Pojok Kiri Atas</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-amber-400 text-blue-950 px-2 py-1 rounded-lg">
              Pojok Kiri Atas
            </span>
          </div>

          {/* Prioritas Siswa Mata Minus Toggle */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500 text-white shadow-xs">
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-950">Prioritaskan Siswa Tertentu di Depan</h4>
                  <p className="text-[10px] text-red-700">Otomatis taruh siswa bertanda prioritas/minus di Baris 1</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prioritizeMinusInFront}
                onChange={(e) => onConfigChange({ prioritizeMinusInFront: e.target.checked })}
                className="w-5 h-5 rounded-md text-red-600 accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Grid Dimensions Steppers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Jumlah Baris
              </label>
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <button
                  type="button"
                  disabled={rows <= 2}
                  onClick={() => onDimensionsChange(Math.max(2, rows - 1), cols)}
                  className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-extrabold font-mono text-blue-900">
                  {rows} Baris
                </span>
                <button
                  type="button"
                  disabled={rows >= 10}
                  onClick={() => onDimensionsChange(Math.min(10, rows + 1), cols)}
                  className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                {arrangement === '2-2' ? 'Lebar Meja (Pasangan)' : 'Jumlah Kolom'}
              </label>
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <button
                  type="button"
                  disabled={cols <= (arrangement === '2-2' ? 2 : 2)}
                  onClick={() => {
                    const step = arrangement === '2-2' ? 2 : 1;
                    onDimensionsChange(rows, Math.max(2, cols - step));
                  }}
                  className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-extrabold font-mono text-blue-900">
                    {cols} Meja
                  </span>
                  {arrangement === '2-2' && (
                    <span className="text-[9px] text-amber-700 font-bold">
                      ({Math.floor(cols / 2)} pasang)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={cols >= 10}
                  onClick={() => {
                    const step = arrangement === '2-2' ? 2 : 1;
                    onDimensionsChange(rows, Math.min(10, cols + step));
                  }}
                  className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Seat Capacity Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border-2 border-blue-200 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">Total Kursi Tersedia</span>
              <span className="font-mono font-extrabold text-blue-900 text-sm">
                {stats.totalSeats} Kursi
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">Total Siswa Terdaftar</span>
              <span className="font-mono font-extrabold text-blue-900 text-sm">
                {stats.totalStudents} Siswa
              </span>
            </div>

            {/* Occupancy Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex my-1">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    stats.totalSeats > 0 ? (stats.occupiedSeats / stats.totalSeats) * 100 : 0
                  )}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              {stats.emptySeats > 0 ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  {stats.emptySeats} kursi ditandai Kosong
                </span>
              ) : stats.totalStudents > stats.totalSeats ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  ⚠️ Kapasitas kurang ({stats.totalStudents - stats.totalSeats} siswa lebih)
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Semua kursi terisi pas
                </span>
              )}
              {stats.priorityCount > 0 && (
                <span className="text-red-700 font-bold">
                  ⭐ {stats.priorityCount} Prioritas Depan
                </span>
              )}
            </div>
          </div>

          {/* Empty Seat Placement Strategy */}
          {stats.emptySeats > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800">
                Penyebaran Kursi Kosong
              </label>
              <select
                value={emptyStrategy}
                onChange={(e) =>
                  onConfigChange({ emptyStrategy: e.target.value as EmptySeatStrategy })
                }
                className="w-full p-2.5 text-xs font-semibold rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              >
                <option value="random">🎲 Acak Tersebar Merata</option>
                <option value="back">⬇️ Baris Depan Penuh (Kosong di Belakang)</option>
                <option value="front">⬆️ Baris Belakang Penuh (Kosong di Depan)</option>
                <option value="sides">↔️ Tengah Penuh (Kosong di Samping)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Detail & Pengaturan Kelas */}
      {activeTab === 'info' && (
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800">
              Mata Pelajaran / Nama Kelas
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => onConfigChange({ title: e.target.value })}
              className="w-full p-2.5 text-xs font-medium rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Contoh: Kelas 10 MIPA 1 • Matematika"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800">
              Nama Guru / Wali Kelas
            </label>
            <input
              type="text"
              value={config.teacherName}
              onChange={(e) => onConfigChange({ teacherName: e.target.value })}
              className="w-full p-2.5 text-xs font-medium rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800">
                Ruang Kelas
              </label>
              <input
                type="text"
                value={config.roomNumber}
                onChange={(e) => onConfigChange({ roomNumber: e.target.value })}
                className="w-full p-2.5 text-xs font-medium rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Contoh: Ruang 101"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800">
                Tanggal
              </label>
              <input
                type="text"
                value={config.date}
                onChange={(e) => onConfigChange({ date: e.target.value })}
                className="w-full p-2.5 text-xs font-medium rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="27 Agustus 2026"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-800">
              Pilihan Tampilan Visual
            </label>

            <label className="flex items-center justify-between text-xs text-slate-700 font-semibold cursor-pointer">
              <span>Tampilkan Nomor Koordinat Kursi (A1, B2)</span>
              <input
                type="checkbox"
                checked={config.showSeatNumbers}
                onChange={(e) => onConfigChange({ showSeatNumbers: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-700 font-semibold cursor-pointer">
              <span>Tampilkan Penanda Lorong Meja</span>
              <input
                type="checkbox"
                checked={config.showAisleMarkers}
                onChange={(e) => onConfigChange({ showAisleMarkers: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>
          </div>
        </div>
      )}
    </aside>
  );
}
