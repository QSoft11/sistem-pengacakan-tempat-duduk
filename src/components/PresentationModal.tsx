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

  const { rows, cols, arrangement, title, teacherName, roomNumber } = config;

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

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isRevealMode) {
          setRevealedCount((prev) => Math.min(seats.length, prev + 1));
        }
      } else if (e.key === ' ' && !e.repeat) {
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
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto select-none p-4 md:p-8">
      {/* Top Presentation Bar */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-amber-300 flex items-center justify-center shadow-md">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-blue-950 tracking-tight">
              {title || 'Denah Tempat Duduk Kelas'}
            </h1>
            <p className="text-xs text-slate-600 font-semibold">
              Wali Kelas: {teacherName || 'Guru'} • {roomNumber || 'Ruang Kelas'} • Susunan {arrangement === '2-2' ? '2-2 Meja Gandeng' : '1-1 Mandiri'}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5">
          {/* Reveal Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextMode = !isRevealMode;
              setIsRevealMode(nextMode);
              setRevealedCount(nextMode ? 0 : seats.length);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
              isRevealMode
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50'
            }`}
          >
            {isRevealMode ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4 text-blue-600" />}
            <span>{isRevealMode ? 'Keluar Mode Buka Misteri' : 'Mode Tebak Misteri'}</span>
          </button>

          {isRevealMode && (
            <>
              <button
                type="button"
                onClick={() => setRevealedCount((prev) => Math.min(seats.length, prev + 1))}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition-all"
              >
                <span>Buka Berikutnya ({revealedCount}/{seats.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setRevealedCount(seats.length)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Buka Semua
              </button>
            </>
          )}

          {/* Shuffle */}
          <button
            type="button"
            onClick={() => {
              onShuffle();
              if (isRevealMode) setRevealedCount(0);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <Shuffle className="w-4 h-4 text-amber-300" />
            <span>Acak (Spasi)</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Classroom Projector Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 max-w-7xl mx-auto w-full">
        {/* Front Stage: Meja Guru Pojok Kiri Atas + Papan Tulis */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-stretch gap-4 mb-6">
          {/* Meja Guru Pojok Kiri Atas */}
          <div className="md:w-64 bg-gradient-to-br from-amber-400 to-amber-500 text-blue-950 rounded-2xl p-3.5 shadow-md border-2 border-amber-500 flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-900 text-amber-300 px-2 py-0.5 rounded-md">
                📍 Pojok Kiri Atas
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            </div>

            <div className="my-2 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase">Meja Guru</h4>
                <p className="text-[11px] font-bold text-blue-900 truncate max-w-[130px]">{teacherName || 'Bapak/Ibu Guru'}</p>
              </div>
            </div>

            <div className="text-[10px] font-semibold text-blue-950 border-t border-amber-600/30 pt-1">
              Ruang: {roomNumber || 'Kelas'}
            </div>
          </div>

          {/* Papan Tulis */}
          <div className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl px-6 py-3.5 shadow-md border-2 border-blue-500 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-300 animate-ping" />
                <span className="font-extrabold text-sm uppercase tracking-widest text-white">
                  📋 PAPAN TULIS • DEPAN KELAS
                </span>
              </div>
              <span className="text-xs bg-amber-400 text-blue-950 font-bold px-2.5 py-0.5 rounded-lg">
                Fokus Pandangan Siswa
              </span>
            </div>
            <div className="w-full h-1.5 bg-blue-300 rounded-full my-2 opacity-80" />
            <div className="text-[11px] text-blue-100 font-semibold">
              Baris 1 & 2 Prioritas Siswa Mata Minus
            </div>
          </div>
        </div>

        {/* Dynamic Projector Seating Layout */}
        <div className="w-full">
          {arrangement === '1-1' ? (
            <div
              className="grid gap-4 mx-auto w-full"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(140px, 1fr))`,
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
                    className={`h-36 p-4 rounded-2xl flex flex-col justify-between border-2 transition-all shadow-sm ${
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
                        <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                          👓 Minus
                        </span>
                      )}
                      {seat.isPinned && <span>📌</span>}
                    </div>

                    <div className="flex flex-col items-center justify-center my-auto text-center">
                      {seat.isEmpty ? (
                        <span className="text-xs italic text-slate-400 font-semibold">Kursi Kosong</span>
                      ) : isRevealed ? (
                        <motion.div
                          initial={{ rotateX: 90, opacity: 0 }}
                          animate={{ rotateX: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-base md:text-lg font-extrabold text-blue-950 leading-tight">
                            Absen #{seat.absenNo || idx + 1}
                          </span>
                          {seat.studentName && !seat.studentName.toLowerCase().startsWith('siswa absen') && (
                            <span className="text-[11px] text-slate-600 font-bold mt-1">
                              {seat.studentName}
                            </span>
                          )}
                        </motion.div>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-300 text-amber-950 font-black text-xl animate-bounce">
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
            <div className="flex flex-col gap-5 w-full mx-auto">
              {rowsMap.map((rowSeats, rIdx) => {
                const pairs: Seat[][] = [];
                for (let i = 0; i < rowSeats.length; i += 2) {
                  pairs.push(rowSeats.slice(i, i + 2));
                }

                return (
                  <div
                    key={`pres-row-${rIdx}`}
                    className="grid gap-8 items-center w-full"
                    style={{
                      gridTemplateColumns: `repeat(${pairsPerRow}, minmax(280px, 1fr))`,
                    }}
                  >
                    {pairs.map((pair, pIdx) => (
                      <div
                        key={`pres-pair-${rIdx}-${pIdx}`}
                        className="grid grid-cols-2 gap-2 p-2 rounded-2xl bg-slate-200/80 border-2 border-slate-300 shadow-sm"
                      >
                        {pair.map((seat, sIdx) => {
                          const seatGlobalIdx = rIdx * cols + pIdx * 2 + sIdx;
                          const isRevealed = !isRevealMode || seatGlobalIdx < revealedCount;

                          return (
                            <motion.div
                              key={seat.id}
                              layout
                              className={`h-36 p-3.5 rounded-xl flex flex-col justify-between border-2 transition-all ${
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
                                  <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1 py-0.2 rounded flex items-center gap-0.5">
                                    <Glasses className="w-3 h-3" /> Minus
                                  </span>
                                )}
                                {seat.isPinned && <span>📌</span>}
                              </div>

                              <div className="flex flex-col items-center justify-center my-auto text-center">
                                {seat.isEmpty ? (
                                  <span className="text-xs italic text-slate-400 font-semibold">Kosong</span>
                                ) : isRevealed ? (
                                  <motion.div
                                    initial={{ rotateX: 90, opacity: 0 }}
                                    animate={{ rotateX: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <span className="text-sm md:text-base font-extrabold text-blue-950 leading-tight block">
                                      Absen #{seat.absenNo || seatGlobalIdx + 1}
                                    </span>
                                    {seat.studentName && !seat.studentName.toLowerCase().startsWith('siswa absen') && (
                                      <span className="text-[11px] text-slate-600 font-bold mt-0.5 block">
                                        {seat.studentName}
                                      </span>
                                    )}
                                  </motion.div>
                                ) : (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-300 text-amber-950 font-black text-lg animate-bounce">
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
  );
}
