'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Shuffle,
  ChevronRight,
  Presentation,
  Glasses,
  Laptop,
  Pin,
} from 'lucide-react';
import { Seat, ClassroomConfig } from '../types/seating';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  seats: Seat[];
  config: ClassroomConfig;
  onShuffle: () => void;
}

export function PresentationModal({
  isOpen,
  onClose,
  seats,
  config,
  onShuffle,
}: PresentationModalProps) {
  const [revealedCount, setRevealedCount] = useState<number>(seats.length);
  const [isRevealMode, setIsRevealMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const { rows, cols, arrangement, title, teacherName, roomNumber, teacherDeskPosition, date, validUntilDate } = config;
  const isDeskRight = teacherDeskPosition === 'top-right';

  useEffect(() => {
    if (isOpen) {
      if (isRevealMode) {
        setRevealedCount(0);
      } else {
        setRevealedCount(seats.length);
      }
    }
  }, [isOpen, isRevealMode, seats.length]);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcut listener inside presentation mode
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        onShuffle();
        if (isRevealMode) setRevealedCount(0);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onShuffle, isRevealMode, seats.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col overflow-y-auto overflow-x-hidden p-3 sm:p-6 text-slate-100 max-w-full w-full min-w-0">
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 p-2.5 sm:p-3 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl max-w-5xl mx-auto w-full sticky top-2 z-40 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-400 text-blue-950 font-black shrink-0">
            <Presentation className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-base font-extrabold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {title || 'Tampilan Denah Kelas'}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
              Mode Proyektor • {seats.length} Total Kursi
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsRevealMode((prev) => !prev)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
              isRevealMode
                ? 'bg-amber-400 text-blue-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            {isRevealMode ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">
              {isRevealMode ? 'Tebak Satu-Satu: AKTIF' : 'Buka Semua'}
            </span>
          </button>

          {isRevealMode && (
            <button
              type="button"
              disabled={revealedCount >= seats.length}
              onClick={() => setRevealedCount((prev) => Math.min(seats.length, prev + 1))}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md disabled:opacity-40 transition-all animate-pulse"
            >
              <span>Buka</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onShuffle}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            title="Acak Tempat Duduk"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors hidden sm:flex"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Classroom Projector Canvas */}
      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center my-4 sm:my-6 max-w-7xl mx-auto w-full min-w-0">
        {/* Front Stage: Meja Guru (Pojok Kiri / Kanan Atas) + Papan Tulis */}
        <div
          className={`w-full max-w-5xl flex flex-col ${
            isDeskRight ? 'md:flex-row-reverse' : 'md:flex-row'
          } items-stretch gap-3 sm:gap-4 mb-4 sm:mb-6 min-w-0`}
        >
          {/* Meja Guru */}
          <div className="md:w-64 bg-gradient-to-br from-amber-400 to-amber-500 text-blue-950 rounded-2xl p-3.5 shadow-md border-2 border-amber-500 flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-900 text-amber-300 px-2 py-0.5 rounded-md">
                {isDeskRight ? 'Pojok Kanan Atas' : 'Pojok Kiri Atas'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            </div>

            <div className="my-2 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0">
                <Presentation className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase">Meja Guru</h4>
                <p className="text-[11px] font-bold text-blue-900 truncate max-w-[150px]">{teacherName || 'Bapak/Ibu Guru'}</p>
              </div>
            </div>

            <div className="text-[10px] font-semibold text-blue-950 border-t border-amber-600/30 pt-1">
              Ruang: {roomNumber || 'Kelas'}
            </div>
          </div>

          {/* Papan Tulis */}
          <div className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl px-4 sm:px-6 py-3.5 shadow-md border-2 border-blue-500 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping shrink-0" />
                <span className="font-extrabold text-xs sm:text-sm uppercase tracking-widest text-white truncate">
                  PAPAN TULIS • DEPAN KELAS
                </span>
              </div>
              <span className="text-[10px] sm:text-xs bg-amber-400 text-blue-950 font-bold px-2 py-0.5 rounded-lg shrink-0">
                Fokus Siswa
              </span>
            </div>
            <div className="w-full h-1.5 bg-blue-300 rounded-full my-2 opacity-80" />
            <div className="text-[10px] sm:text-[11px] text-blue-100 font-semibold truncate">
              Masa Berlaku: {date} s.d. {validUntilDate || date} • Prioritas Baris 1
            </div>
          </div>
        </div>

        {/* Dynamic Projector Seating Layout with isolated Horizontal Scroll */}
        <div className="w-full max-w-full overflow-x-auto pb-6 scrollbar-thin">
          <div className="min-w-max mx-auto flex justify-center px-2">
            {arrangement === '1-1' ? (
              <div
                className="grid gap-3 sm:gap-4 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(130px, 1fr))`,
                }}
              >
                {seats.map((seat, idx) => {
                  const isRevealed = !isRevealMode || idx < revealedCount;
                  return (
                    <motion.div
                      key={seat.id}
                      layout
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className={`w-32 sm:w-36 h-32 sm:h-36 p-3 sm:p-4 rounded-2xl flex flex-col justify-between border-2 transition-all shadow-sm ${
                        seat.isEmpty
                          ? 'border-dashed border-slate-300 bg-white/60'
                          : isRevealed
                          ? 'border-blue-200 bg-white shadow-md'
                          : 'border-amber-300 bg-amber-50 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                        <span>{seat.label}</span>
                        {seat.hasMinus && (
                          <span className="text-[9px] sm:text-[10px] text-red-600 font-bold bg-red-100 px-1 py-0.2 rounded flex items-center gap-0.5">
                            <Glasses className="w-3 h-3" /> Minus
                          </span>
                        )}
                        {seat.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      </div>

                      <div className="flex flex-col items-center justify-center my-auto text-center w-full min-w-0">
                        {seat.isEmpty ? (
                          <span className="text-xs italic text-slate-400 font-semibold">Kursi Kosong</span>
                        ) : isRevealed ? (
                          <motion.div
                            initial={{ rotateX: 90, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center w-full min-w-0"
                          >
                            {seat.studentName && !/^absen[\s\.\:\-]*\d+$/i.test(seat.studentName.trim()) ? (
                              <>
                                <span className="text-xs sm:text-sm md:text-base font-black text-blue-950 leading-tight block text-center px-1 truncate w-full">
                                  {seat.studentName}
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-mono font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md mt-1 block">
                                  Absen #{seat.absenNo || idx + 1}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm sm:text-base md:text-lg font-extrabold text-blue-950 leading-tight">
                                Absen #{seat.absenNo || idx + 1}
                              </span>
                            )}
                          </motion.div>
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-300 text-amber-950 font-black text-lg sm:text-xl animate-bounce">
                            ?
                          </div>
                        )}
                      </div>

                      <div className="h-1" />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-5 mx-auto">
                {rowsMap.map((rowSeats, rIdx) => {
                  const pairs: Seat[][] = [];
                  for (let i = 0; i < rowSeats.length; i += 2) {
                    pairs.push(rowSeats.slice(i, i + 2));
                  }

                  return (
                    <div
                      key={`pres-row-${rIdx}`}
                      className="grid gap-4 sm:gap-8 items-center"
                      style={{
                        gridTemplateColumns: `repeat(${pairsPerRow}, minmax(260px, 1fr))`,
                      }}
                    >
                      {pairs.map((pair, pIdx) => (
                        <div
                          key={`pres-pair-${rIdx}-${pIdx}`}
                          className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-200/80 border-2 border-slate-300 shadow-sm"
                        >
                          {pair.map((seat, sIdx) => {
                            const seatGlobalIdx = rIdx * cols + pIdx * 2 + sIdx;
                            const isRevealed = !isRevealMode || seatGlobalIdx < revealedCount;

                            return (
                              <motion.div
                                key={seat.id}
                                layout
                                className={`w-28 sm:w-36 h-32 sm:h-36 p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between border-2 transition-all ${
                                  seat.isEmpty
                                    ? 'border-dashed border-slate-300 bg-white/70'
                                    : isRevealed
                                    ? 'border-blue-200 bg-white shadow-md'
                                    : 'border-amber-300 bg-amber-50'
                                } ${
                                  seat.pairSide === 'left'
                                    ? 'rounded-r-md border-r-dashed'
                                    : 'rounded-l-md border-l-dashed'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                                  <span>{seat.label}</span>
                                  {seat.hasMinus && (
                                    <span className="text-[9px] sm:text-[10px] text-red-600 font-bold bg-red-100 px-1 py-0.2 rounded flex items-center gap-0.5">
                                      <Glasses className="w-3 h-3" /> Minus
                                    </span>
                                  )}
                                  {seat.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                </div>

                                <div className="flex flex-col items-center justify-center my-auto text-center w-full min-w-0">
                                  {seat.isEmpty ? (
                                    <span className="text-xs italic text-slate-400 font-semibold">Kosong</span>
                                  ) : isRevealed ? (
                                    <motion.div
                                      initial={{ rotateX: 90, opacity: 0 }}
                                      animate={{ rotateX: 0, opacity: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="w-full min-w-0"
                                    >
                                      {seat.studentName && !/^absen[\s\.\:\-]*\d+$/i.test(seat.studentName.trim()) ? (
                                        <>
                                          <span className="text-xs sm:text-sm md:text-base font-black text-blue-950 leading-tight block text-center px-0.5 truncate w-full">
                                            {seat.studentName}
                                          </span>
                                          <span className="text-[9px] sm:text-[10px] font-mono font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md mt-0.5 inline-block">
                                            Absen #{seat.absenNo || seatGlobalIdx + 1}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-xs sm:text-sm md:text-base font-extrabold text-blue-950 leading-tight block">
                                          Absen #{seat.absenNo || seatGlobalIdx + 1}
                                        </span>
                                      )}
                                    </motion.div>
                                  ) : (
                                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-300 text-amber-950 font-black text-base sm:text-lg animate-bounce">
                                      ?
                                    </div>
                                  )}
                                </div>

                                <div className="h-1" />
                              </motion.div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
