'use client';

import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['Spasi'], description: 'Acak ulang posisi tempat duduk kelas' },
  { keys: ['⌘', 'Z'], description: 'Urungkan (Undo) perubahan terakhir' },
  { keys: ['⌘', '⇧', 'Z'], description: 'Ulangi (Redo) perubahan yang diurungkan' },
  { keys: ['P'], description: 'Buka / Tutup Mode Proyektor Layar Penuh' },
  { keys: ['1'], description: 'Ganti ke susunan 1-1 Meja Mandiri' },
  { keys: ['2'], description: 'Ganti ke susunan 2-2 Meja Gandeng' },
  { keys: ['Esc'], description: 'Batalkan pilihan tukar meja / Tutup modal' },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border-2 border-blue-100 shadow-2xl p-6 flex flex-col gap-4 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
              <Command className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-blue-950">Tombol Pintas (Keyboard Shortcuts)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0"
            >
              <span className="text-slate-700 font-medium">
                {item.description}
              </span>
              <div className="flex items-center gap-1">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-1 text-[11px] font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-lg shadow-2xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-1 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center text-[11px] font-semibold text-amber-900">
          💡 Tips Guru: Klik meja pertama, lalu klik meja kedua untuk langsung menukar posisi duduk dua siswa.
        </div>
      </div>
    </div>
  );
}
