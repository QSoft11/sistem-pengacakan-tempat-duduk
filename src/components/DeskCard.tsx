'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Pin, Armchair, Star } from 'lucide-react';
import { Seat, DeskArrangement } from '../types/seating';

interface DeskCardProps {
  seat: Seat;
  arrangement: DeskArrangement;
  showSeatNumbers: boolean;
  showInitials?: boolean;
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
  isSelectedForSwap,
  isAnySelectedForSwap,
  onSelectOrSwap,
  onTogglePin,
  index,
}: DeskCardProps) {
  const { label, studentName, absenNo, isPriorityFront, isEmpty, isPinned, pairSide } = seat;

  // Formatted attendance number
  const numDisplay = absenNo !== undefined ? (absenNo < 10 ? `0${absenNo}` : `${absenNo}`) : '';

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
        delay: Math.min(index * 0.008, 0.2),
      }}
      onClick={() => onSelectOrSwap(seat.id)}
      className={`group relative flex flex-col justify-between p-2.5 sm:p-3 h-28 sm:h-32 rounded-2xl transition-all duration-200 cursor-pointer select-none border text-center ${
        isSelectedForSwap
          ? 'ring-4 ring-blue-500 border-blue-500 bg-blue-50/95 shadow-xl shadow-blue-200 z-10'
          : isAnySelectedForSwap
          ? 'hover:ring-2 hover:ring-blue-400 hover:border-blue-400 border-slate-200 bg-white shadow-sm'
          : isEmpty
          ? 'border-dashed border-slate-300 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50/40'
          : isPinned
          ? 'border-amber-400 bg-amber-50/60 hover:border-amber-500 shadow-xs'
          : isPriorityFront
          ? 'border-red-400 bg-red-50/40 hover:border-red-500 shadow-xs ring-1 ring-red-100'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md shadow-2xs'
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
        <div className="flex items-center gap-1">
          {showSeatNumbers && (
            <span
              className={`text-[10px] sm:text-[11px] font-mono font-extrabold px-1.5 py-0.2 rounded-md ${
                isEmpty
                  ? 'bg-slate-200 text-slate-600'
                  : isPriorityFront
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {label}
            </span>
          )}

          {arrangement === '2-2' && (
            <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
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
                ? 'bg-amber-400 text-amber-950 font-bold shadow-xs opacity-100'
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

      {/* Center content: Centered Bold Attendance Badge & Priority Status */}
      <div className="my-auto flex flex-col items-center justify-center w-full px-0.5">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-0.5 text-slate-400">
            <Armchair className="w-5 h-5 text-slate-300" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-400">
              Kosong
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-1">
            {/* Primary Attendance Badge (Contoh: ABSEN 17, ABSEN 20) */}
            <div
              className={`w-full max-w-[130px] py-1 px-2 rounded-xl flex items-center justify-center gap-1.5 font-black shadow-xs transition-all ${
                isPinned
                  ? 'bg-amber-400 text-amber-950 border border-amber-500'
                  : isPriorityFront
                  ? 'bg-red-600 text-white border border-red-700 shadow-sm'
                  : 'bg-blue-600 text-white border border-blue-700 shadow-sm'
              }`}
            >
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-tight opacity-90">
                Absen
              </span>
              <span className="text-sm sm:text-base md:text-lg font-black font-mono leading-none">
                {numDisplay || '?'}
              </span>
            </div>

            {/* Priority Indicator Pill */}
            {isPriorityFront ? (
              <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-black text-red-700 bg-red-100 px-1.5 py-0.2 rounded-full border border-red-200">
                <Star className="w-2.5 h-2.5 text-red-600 fill-red-600 shrink-0" />
                <span className="truncate">Prioritas Depan</span>
              </span>
            ) : isPinned ? (
              <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded-full border border-amber-300">
                📌 Terkunci
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Bottom bar indicator / swap hint */}
      <div className="flex items-center justify-center text-[9px] sm:text-[10px] text-slate-400 h-3">
        {isSelectedForSwap ? (
          <span className="text-blue-600 font-bold animate-pulse">
            Klik meja tukar
          </span>
        ) : (
          <span className="text-transparent group-hover:text-blue-600 font-semibold transition-colors">
            Tukar
          </span>
        )}
      </div>
    </motion.div>
  );
}
