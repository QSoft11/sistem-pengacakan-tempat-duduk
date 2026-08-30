'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation,
  ArrowDownUp,
  X,
  DoorOpen,
  Laptop,
} from 'lucide-react';
import { DeskCard } from './DeskCard';
import { Seat, ClassroomConfig } from '../types/seating';

interface ClassroomGridProps {
  seats: Seat[];
  config: ClassroomConfig;
  selectedSeatForSwap: string | null;
  onSelectOrSwap: (seatId: string) => void;
  onTogglePin: (seatId: string) => void;
  onCancelSwap: () => void;
}

export function ClassroomGrid({
  seats,
  config,
  selectedSeatForSwap,
  onSelectOrSwap,
  onTogglePin,
  onCancelSwap,
}: ClassroomGridProps) {
  const { rows, cols, arrangement, frontPosition, teacherDeskPosition, showSeatNumbers, showInitials, showAisleMarkers } = config;

  // Group seats by row
  const rowsMap = useMemo(() => {
    const map: Seat[][] = [];
    for (let r = 0; r < rows; r++) {
      map.push([]);
    }
    seats.forEach((seat) => {
      if (map[seat.row]) {
        map[seat.row].push(seat);
      }
    });
    map.forEach((rowSeats) => rowSeats.sort((a, b) => a.col - b.col));
    return map;
  }, [seats, rows]);

  const pairsPerRow = Math.ceil(cols / 2);

  const selectedSeat = useMemo(() => {
    return seats.find((s) => s.id === selectedSeatForSwap);
  }, [seats, selectedSeatForSwap]);

  // Stage Header: Meja Guru (Pojok Kiri / Kanan Atas) + Papan Tulis Utama
  const isDeskRight = config.teacherDeskPosition === 'top-right';
  const StageHeader = (
    <div
      data-export-stage-header="true"
      className={`w-full max-w-5xl my-4 flex flex-col ${
        isDeskRight ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-stretch gap-3.5`}
    >
      {/* Meja Guru */}
      <div
        data-export-teacher-desk="true"
        className="md:w-72 bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 text-blue-950 rounded-2xl p-3.5 shadow-md border-2 border-amber-500 flex flex-col justify-between shrink-0"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-900 text-amber-300 px-2 py-0.5 rounded-md">
            {isDeskRight ? 'Pojok Kanan Atas' : 'Pojok Kiri Atas'}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping export-ignore" />
        </div>

        <div className="my-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shadow-xs shrink-0">
            <Presentation className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black uppercase tracking-tight">Meja Guru</h4>
            <p className="text-[11px] font-extrabold text-blue-900 truncate max-w-[150px]">
              {config.teacherName || 'Bapak/Ibu Guru'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-blue-950 border-t border-amber-500/50 pt-1.5">
          <span>Ruang: {config.roomNumber || 'Kelas'}</span>
          <span className="flex items-center gap-1">
            <Laptop className="w-3 h-3 text-blue-900" /> Aktif Mengajar
          </span>
        </div>
      </div>

      {/* Papan Tulis Utama */}
      <div
        data-export-blackboard="true"
        className="flex-1 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl px-6 py-3.5 shadow-md border-2 border-blue-500 flex flex-col justify-between min-w-0"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-3 rounded-full bg-amber-300 animate-pulse export-ignore shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white truncate">
              PAPAN TULIS UTAMA (DEPAN KELAS)
            </span>
          </div>
          <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-lg shrink-0">
            {config.title || 'Mata Pelajaran'}
          </span>
        </div>

        <div className="w-full h-1.5 bg-blue-300 rounded-full my-2 opacity-80" />

        <div className="flex items-center justify-between text-[11px] text-blue-100 font-semibold gap-2">
          <span className="truncate">Masa Berlaku: {config.date} s.d. {config.validUntilDate || config.date}</span>
          <span className="text-amber-200 font-bold shrink-0">Baris 1 & 2 Prioritas Mata Minus</span>
        </div>
      </div>
    </div>
  );

  const RearClassroomBanner = (
    <div data-export-rear-banner="true" className="w-full flex items-center justify-center my-6">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold px-5 py-2 rounded-full border-2 border-dashed border-slate-300 bg-white shadow-2xs">
        <DoorOpen className="w-4 h-4 text-amber-500" />
        <span>RUANG LEYEH-LEYEH MAS EGA ANGGORO & MAS DAMA</span>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center w-full max-w-full min-h-[600px] p-3 sm:p-6 bg-white rounded-3xl border-2 border-blue-100 shadow-sm transition-all overflow-hidden min-w-0">
      {/* Swap Selection Banner */}
      <AnimatePresence>
        {selectedSeatForSwap && selectedSeat && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="sticky top-4 z-30 mb-4 flex items-center justify-between gap-4 px-5 py-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 text-sm font-semibold w-full max-w-md border border-blue-400 export-ignore"
          >
            <div className="flex items-center gap-2">
              <ArrowDownUp className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>
                Memilih{' '}
                <strong className="underline decoration-amber-300 decoration-2">
                  {selectedSeat.studentName || selectedSeat.label}
                </strong>
                . Klik meja target untuk bertukar.
              </span>
            </div>
            <button
              onClick={onCancelSwap}
              type="button"
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classroom Canvas to Export */}
      <div id="classroom-grid-canvas" data-export-root="true" className="w-full max-w-full flex flex-col items-center min-w-0">
        {/* Header if top (Meja Guru Pojok Kiri Atas + Papan Tulis) */}
        {frontPosition === 'top' && StageHeader}

        {/* Dynamic Seating Grid Container */}
        <div
          data-export-grid-scroll="true"
          className="w-full max-w-full my-4 overflow-x-auto py-2 px-1 scrollbar-thin"
        >
          {arrangement === '1-1' ? (
            /* 1-1 Layout: Grid Meja Mandiri */
            <div
              className="grid gap-2.5 sm:gap-3.5 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(100px, 1fr))`,
                minWidth: `${cols * 105}px`,
              }}
            >
              <AnimatePresence mode="popLayout">
                {seats.map((seat, idx) => (
                  <DeskCard
                    key={seat.id}
                    seat={seat}
                    index={idx}
                    arrangement="1-1"
                    showSeatNumbers={showSeatNumbers}
                    showInitials={showInitials}
                    displayMode={config.displayMode}
                    isSelectedForSwap={selectedSeatForSwap === seat.id}
                    isAnySelectedForSwap={!!selectedSeatForSwap}
                    onSelectOrSwap={onSelectOrSwap}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* 2-2 Layout: Baris Meja Berpasangan dengan Lorong Jalan */
            <div
              className="flex flex-col gap-3.5 sm:gap-4 mx-auto w-full"
              style={{
                minWidth: `${pairsPerRow * 220}px`,
              }}
            >
              {/* Optional Aisle Header Markers */}
              {showAisleMarkers && pairsPerRow > 1 && (
                <div
                  className="grid gap-4 sm:gap-6 px-1 mb-1"
                  style={{
                    gridTemplateColumns: `repeat(${pairsPerRow}, minmax(210px, 1fr))`,
                  }}
                >
                  {Array.from({ length: pairsPerRow }).map((_, pIdx) => (
                    <div
                      key={`pair-header-${pIdx}`}
                      className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-700 bg-blue-50/70 px-3 py-1 rounded-lg border border-blue-100 shadow-2xs"
                    >
                      <span>Kelompok Meja {pIdx + 1}</span>
                      {pIdx < pairsPerRow - 1 && (
                        <span className="text-[10px] text-amber-600 font-semibold hidden sm:inline">
                          [ Lorong ]
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Rows */}
              {rowsMap.map((rowSeats, rIdx) => {
                // Break row into pairs of 2
                const pairs: Seat[][] = [];
                for (let i = 0; i < rowSeats.length; i += 2) {
                  pairs.push(rowSeats.slice(i, i + 2));
                }

                return (
                  <div
                    key={`row-${rIdx}`}
                    className="grid gap-4 sm:gap-6 items-center"
                    style={{
                      gridTemplateColumns: `repeat(${pairsPerRow}, minmax(210px, 1fr))`,
                    }}
                  >
                    {pairs.map((pair, pIdx) => (
                      <div
                        key={`pair-${rIdx}-${pIdx}`}
                        className="grid grid-cols-2 gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border-2 border-slate-200 shadow-2xs hover:border-blue-200 transition-colors"
                      >
                        {pair.map((seat, seatIdx) => (
                          <DeskCard
                            key={seat.id}
                            seat={seat}
                            index={rIdx * cols + pIdx * 2 + seatIdx}
                            arrangement="2-2"
                            showSeatNumbers={showSeatNumbers}
                            showInitials={showInitials}
                            displayMode={config.displayMode}
                            isSelectedForSwap={selectedSeatForSwap === seat.id}
                            isAnySelectedForSwap={!!selectedSeatForSwap}
                            onSelectOrSwap={onSelectOrSwap}
                            onTogglePin={onTogglePin}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Header if bottom */}
        {frontPosition === 'bottom' ? StageHeader : RearClassroomBanner}
      </div>
    </div>
  );
}
