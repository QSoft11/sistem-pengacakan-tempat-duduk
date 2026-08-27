'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Pin, Armchair, Glasses, Star } from 'lucide-react';
import { Seat, DeskArrangement } from '../types/seating';

interface DeskCardProps {
  seat: Seat;
  arrangement: DeskArrangement;
  showSeatNumbers: boolean;
  showInitials: boolean;
  isSelectedForSwap: boolean;
  isAnySelectedForSwap: boolean;
  onSelectOrSwap: (seatId: string) => void;
  onTogglePin: (seatId: string) => void;
  index: number;
}

export function DeskCard({
  seat,
  arrangement,
  showSeatNumbers,
  showInitials,
  isSelectedForSwap,
  isAnySelectedForSwap,
  onSelectOrSwap,
  onTogglePin,
  index,
}: DeskCardProps) {
  const { label, studentName, absenNo, hasMinus, isPriorityFront, isEmpty, isPinned, pairSide } = seat;

  const formattedAbsen = absenNo !== undefined ? (absenNo < 10 ? `0${absenNo}` : `${absenNo}`) : '';
  const isNameGenericAbsen = studentName?.toLowerCase().startsWith('siswa absen') || studentName?.toLowerCase().startsWith('absen');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 30,
        mass: 0.8,
        delay: Math.min(index * 0.012, 0.3),
      }}
      onClick={() => onSelectOrSwap(seat.id)}
      className={`group relative flex flex-col justify-between p-3 h-32 rounded-2xl transition-all duration-200 cursor-pointer select-none border text-left ${
        isSelectedForSwap
          ? 'ring-3 ring-blue-500 border-blue-500 bg-blue-50/90 shadow-lg shadow-blue-200'
          : isAnySelectedForSwap
          ? 'hover:ring-2 hover:ring-blue-400 hover:border-blue-400 border-slate-200 bg-white shadow-sm'
          : isEmpty
          ? 'border-dashed border-slate-300 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/30'
          : isPinned
          ? 'border-amber-300 bg-amber-50/40 hover:border-amber-400 shadow-sm'
          : isPriorityFront
          ? 'border-red-300 bg-red-50/20 hover:border-red-400 shadow-sm'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md shadow-xs'
      } ${
        arrangement === '2-2'
          ? pairSide === 'left'
            ? 'rounded-r-md border-r-dashed'
            : 'rounded-l-md border-l-dashed'
          : ''
      }`}
    >
      {/* Top row: Koordinat Meja + Pin Button */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5 flex-wrap">
          {showSeatNumbers && (
            <span
              className={`text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                isEmpty
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {label}
            </span>
          )}

          {arrangement === '2-2' && (
            <span className="text-[10px] text-slate-400 font-mono">
              {pairSide === 'left' ? 'Kiri' : 'Kanan'}
            </span>
          )}
        </div>

        {/* Action / Pin Button */}
        {!isEmpty && studentName && (
          <button
            type="button"
            title={isPinned ? 'Kursi terkunci (tidak akan teracak)' : 'Kunci posisi kursi'}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(seat.id);
            }}
            className={`p-1 rounded-md transition-colors export-ignore ${
              isPinned
                ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                : 'text-slate-400 hover:bg-amber-100 hover:text-amber-800 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Pin
              className={`w-3.5 h-3.5 transition-transform ${
                isPinned ? 'fill-current rotate-45' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Center content: Prominent Attendance Number (1, 2, 3...) & Student Name */}
      <div className="my-auto flex items-center gap-3">
        {isEmpty ? (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-9 h-9 rounded-xl border border-dashed border-slate-300 flex items-center justify-center bg-white">
              <Armchair className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs italic font-bold text-slate-400">
                Kursi Kosong
              </span>
              <span className="text-[10px] text-slate-400">Tersedia</span>
            </div>
          </div>
        ) : (
          <>
            {/* Big Bold Attendance Number Badge (Absen 1, 2, 3...) */}
            <div
              className={`w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center font-black shadow-xs transition-all ${
                isPinned
                  ? 'bg-amber-400 text-amber-950 border border-amber-500'
                  : isPriorityFront
                  ? 'bg-red-500 text-white border border-red-600'
                  : 'bg-blue-600 text-white border border-blue-700'
              }`}
            >
              <span className="text-[8px] uppercase tracking-tighter opacity-80 leading-none">Absen</span>
              <span className="text-lg font-extrabold font-mono leading-none mt-0.5">
                {formattedAbsen || '?'}
              </span>
            </div>

            {/* Attendance Title */}
            <div className="min-w-0 flex-1">
              <p
                className="text-sm sm:text-base font-extrabold text-blue-950 truncate leading-snug tracking-tight"
                title={`Absen ${absenNo}`}
              >
                Absen {absenNo}
              </p>
              
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {isPriorityFront && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-700 bg-red-100 px-1.5 py-0.2 rounded border border-red-200">
                    <Star className="w-3 h-3 text-red-600 fill-red-600" />
                    Prioritas Depan
                  </span>
                )}
                {isPinned && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded">
                    📌 Terkunci
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom bar indicator / swap hint */}
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        {isSelectedForSwap ? (
          <span className="text-blue-600 font-bold animate-pulse">
            Terpilih (Klik meja lain untuk tukar)
          </span>
        ) : (
          <span className="text-transparent group-hover:text-blue-600 font-medium transition-colors">
            Klik untuk tukar
          </span>
        )}
      </div>
    </motion.div>
  );
}
