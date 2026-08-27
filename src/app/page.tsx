'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSeatingArranger } from '../hooks/useSeatingArranger';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ClassroomGrid } from '../components/ClassroomGrid';
import { PresentationModal } from '../components/PresentationModal';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';
import {
  exportElementAsPng,
  exportElementAsPdf,
  exportSeatsToCsv,
} from '../utils/exportHelper';
import { CheckCircle2, Star, Glasses } from 'lucide-react';

export default function SeatingAppPage() {
  const {
    config,
    setConfig,
    setArrangement,
    setDimensions,
    studentsText,
    setStudentsText,
    priorityAbsenSet,
    seats,
    selectedSeatForSwap,
    setSelectedSeatForSwap,
    shuffleSeats,
    handleTogglePin,
    handleSelectOrSwap,
    loadPreset,
    generateAbsenFromCount,
    generateAbsenOnly,
    toggleStudentPriority,
    setPriorityFromListStr,
    clearRoster,
    alphabetizeRoster,
    sortByAbsen,
    addExampleMinusTags,
    undo,
    redo,
    canUndo,
    canRedo,
    isShuffling,
    stats,
  } = useSeatingArranger();

  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) return;

      // Spasi atau R -> Acak
      if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        shuffleSeats();
      }
      // Undo: Cmd+Z atau Ctrl+Z
      else if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      // Redo: Cmd+Shift+Z atau Ctrl+Shift+Z atau Ctrl+Y
      else if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        redo();
      }
      // Layouts
      else if (e.key === '1') {
        setArrangement('1-1');
      } else if (e.key === '2') {
        setArrangement('2-2');
      }
      // Proyektor: P
      else if (e.key.toLowerCase() === 'p') {
        setIsPresentationOpen((prev) => !prev);
      }
      // Escape
      else if (e.key === 'Escape') {
        setSelectedSeatForSwap(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shuffleSeats, undo, redo, setArrangement, setSelectedSeatForSwap]);

  // Export handlers
  const handleExportPng = async () => {
    const el = document.getElementById('classroom-grid-canvas');
    if (!el) return;
    showToast('Sedang memproses gambar PNG resolusi tinggi...');
    const success = await exportElementAsPng(
      el,
      `${config.title.toLowerCase().replace(/[\s\.\•]+/g, '-')}-denah.png`
    );
    if (success) showToast('Gambar PNG berhasil diunduh!');
  };

  const handleExportPdf = async () => {
    const el = document.getElementById('classroom-grid-canvas');
    if (!el) return;
    showToast('Sedang membuat dokumen PDF siap cetak...');
    const success = await exportElementAsPdf(
      el,
      config,
      `${config.title.toLowerCase().replace(/[\s\.\•]+/g, '-')}-denah.pdf`
    );
    if (success) showToast('Dokumen PDF berhasil diunduh!');
  };

  const handleExportCsv = () => {
    exportSeatsToCsv(seats, config);
    showToast('Data tabel CSV berhasil diekspor!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/80 text-slate-900 font-sans transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-blue-900 text-white rounded-2xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-blue-700">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        config={config}
        stats={stats}
        canUndo={canUndo}
        canRedo={canRedo}
        isShuffling={isShuffling}
        onShuffle={shuffleSeats}
        onUndo={undo}
        onRedo={redo}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        onPrint={handlePrint}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Workspace Layout (Sidebar + Interactive Classroom Visual Map) */}
      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1700px] mx-auto">
        {/* Left Sidebar Control Center */}
        <Sidebar
          studentsText={studentsText}
          onStudentsTextChange={setStudentsText}
          config={config}
          onConfigChange={setConfig}
          onArrangementChange={setArrangement}
          onDimensionsChange={setDimensions}
          onLoadPreset={loadPreset}
          onGenerateAbsenFromCount={generateAbsenFromCount}
          onGenerateAbsenOnly={generateAbsenOnly}
          onTogglePriority={toggleStudentPriority}
          onSetPriorityListStr={setPriorityFromListStr}
          priorityAbsenSet={priorityAbsenSet}
          onClearRoster={clearRoster}
          onAlphabetize={alphabetizeRoster}
          onSortByAbsen={sortByAbsen}
          onAddExampleMinus={addExampleMinusTags}
          stats={stats}
        />

        {/* Right Classroom Visual Map Canvas */}
        <section className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start overflow-y-auto">
          <div className="w-full max-w-5xl flex flex-col gap-4">
            {/* Context bar above canvas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div>
                <h2 className="text-lg font-extrabold text-blue-950">
                  {config.title || 'Denah Tempat Duduk Kelas'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-2 flex-wrap">
                  <span>
                    {config.arrangement === '1-1'
                      ? 'Susunan 1-1 Meja Mandiri'
                      : 'Susunan 2-2 Meja Gandeng + Lorong'}{' '}
                    • {config.rows} Baris × {config.cols} Meja ({stats.totalSeats} Total Kursi)
                  </span>
                  {config.prioritizeMinusInFront && stats.priorityCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-bold border border-red-200">
                      <Star className="w-3 h-3 text-red-600 fill-red-600" /> {stats.priorityCount} Siswa Prioritas di Baris 1 (Papan Tulis)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="hidden sm:inline bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs font-semibold">
                  💡 Meja Guru di Pojok Kiri Atas • Baris 1 untuk Siswa Prioritas
                </span>
              </div>
            </div>

            {/* Visual Classroom Grid Component */}
            <ClassroomGrid
              seats={seats}
              config={config}
              selectedSeatForSwap={selectedSeatForSwap}
              onSelectOrSwap={handleSelectOrSwap}
              onTogglePin={handleTogglePin}
              onCancelSwap={() => setSelectedSeatForSwap(null)}
            />
          </div>
        </section>
      </main>

      {/* Presentation Fullscreen Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        seats={seats}
        config={config}
        onShuffle={shuffleSeats}
      />

      {/* Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
