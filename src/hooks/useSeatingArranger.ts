'use client';

import { useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Seat,
  ClassroomConfig,
  DeskArrangement,
  HistoryState,
} from '../types/seating';
import { PRESET_ROSTERS } from '../utils/presets';
import {
  generateEmptySeats,
  distributeStudents,
  swapSeatPositions,
  togglePin,
  parseStudentLine,
} from '../utils/seatingLogic';

const DEFAULT_PRESET = PRESET_ROSTERS[0]; // Kelas 10 MIPA 1

const DEFAULT_CONFIG: ClassroomConfig = {
  title: 'Kelas 10 SIJA A',
  teacherName: 'Hartitik, S.Pd',
  roomNumber: 'Lab SIJA',
  date: '27 Agustus 2026',
  arrangement: '2-2',
  rows: 5,
  cols: 8, // 4 pasang = 8 meja per baris = 40 meja
  emptyStrategy: 'random',
  frontPosition: 'top',
  teacherDeskPosition: 'top-left', // Pojok kiri atas
  showSeatNumbers: true,
  showInitials: true,
  showAisleMarkers: true,
  prioritizeMinusInFront: true,
  displayMode: 'absen-primary',
};

export function useSeatingArranger() {
  const [config, setConfigState] = useState<ClassroomConfig>(DEFAULT_CONFIG);
  const [studentsText, setStudentsText] = useState<string>(
    DEFAULT_PRESET.students.join('\n')
  );
  const [seats, setSeats] = useState<Seat[]>(() => {
    const base = generateEmptySeats(
      DEFAULT_CONFIG.rows,
      DEFAULT_CONFIG.cols,
      DEFAULT_CONFIG.arrangement
    );
    return distributeStudents(DEFAULT_PRESET.students, base, DEFAULT_CONFIG, false);
  });

  const [selectedSeatForSwap, setSelectedSeatForSwap] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Cleaned and parsed students list
  const studentsRaw = useMemo(() => {
    return studentsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [studentsText]);

  const parsedStudents = useMemo(() => {
    return studentsRaw
      .map((line, idx) => parseStudentLine(line, idx))
      .filter((s) => s.name.length > 0);
  }, [studentsRaw]);

  // Priority students set
  const priorityAbsenSet = useMemo(() => {
    const set = new Set<number>();
    parsedStudents.forEach((s) => {
      if (s.isPriorityFront && s.absenNo !== undefined) {
        set.add(s.absenNo);
      }
    });
    return set;
  }, [parsedStudents]);

  // Statistics
  const stats = useMemo(() => {
    const totalSeats = config.rows * config.cols;
    const totalStudents = parsedStudents.length;
    const occupiedSeats = seats.filter((s) => !s.isEmpty && s.studentName).length;
    const emptySeats = Math.max(0, totalSeats - occupiedSeats);
    const pinnedCount = seats.filter((s) => s.isPinned).length;
    const priorityCount = parsedStudents.filter((s) => s.isPriorityFront).length;
    const minusCount = parsedStudents.filter((s) => s.hasMinus).length;
    const pairsCount =
      config.arrangement === '2-2'
        ? config.rows * Math.floor(config.cols / 2)
        : 0;

    return {
      totalSeats,
      totalStudents,
      occupiedSeats,
      emptySeats,
      pinnedCount,
      priorityCount,
      minusCount,
      pairsCount,
    };
  }, [config, parsedStudents, seats]);

  // Record history snapshot
  const recordHistory = useCallback(
    (description: string) => {
      setHistory((prev) => [
        ...prev.slice(-20),
        {
          seats: JSON.parse(JSON.stringify(seats)),
          description,
          timestamp: Date.now(),
        },
      ]);
      setFuture([]);
    },
    [seats]
  );

  // Update configuration
  const setConfig = useCallback(
    (updates: Partial<ClassroomConfig>) => {
      setConfigState((prev) => {
        const next = { ...prev, ...updates };
        if (
          updates.rows !== undefined ||
          updates.cols !== undefined ||
          updates.arrangement !== undefined ||
          updates.emptyStrategy !== undefined ||
          updates.prioritizeMinusInFront !== undefined
        ) {
          setSeats((currSeats) => distributeStudents(studentsRaw, currSeats, next, false));
        }
        return next;
      });
    },
    [studentsRaw]
  );

  // Switch arrangement (1-1 vs 2-2)
  const setArrangement = useCallback(
    (arrangement: DeskArrangement) => {
      recordHistory(`Ubah tata letak ke konfigurasi ${arrangement}`);
      setConfigState((prev) => {
        let newCols = prev.cols;
        if (arrangement === '2-2' && newCols % 2 !== 0) {
          newCols = newCols + 1;
        }
        const next = { ...prev, arrangement, cols: newCols };
        setSeats((currSeats) => distributeStudents(studentsRaw, currSeats, next, false));
        return next;
      });
    },
    [studentsRaw, recordHistory]
  );

  // Set rows and columns
  const setDimensions = useCallback(
    (rows: number, cols: number) => {
      recordHistory(`Ubah ukuran kelas ke ${rows}x${cols}`);
      setConfigState((prev) => {
        const validatedCols = prev.arrangement === '2-2' && cols % 2 !== 0 ? cols + 1 : cols;
        const next = { ...prev, rows, cols: validatedCols };
        setSeats((currSeats) => distributeStudents(studentsRaw, currSeats, next, false));
        return next;
      });
    },
    [studentsRaw, recordHistory]
  );

  // Generate Absen Otomatis dari Jumlah Siswa Saja
  const generateAbsenFromCount = useCallback(
    (count: number, priorityListStr: string = '') => {
      const validCount = Math.max(1, Math.min(60, count));
      recordHistory(`Buat otomatis ${validCount} siswa absen`);

      // Parse priority numbers
      const prioritySet = new Set<number>();
      if (priorityListStr.trim()) {
        const parts = priorityListStr.split(/[\s,;+]+/);
        parts.forEach((p) => {
          const num = parseInt(p.trim(), 10);
          if (!isNaN(num) && num >= 1 && num <= validCount) {
            prioritySet.add(num);
          }
        });
      }

      const list: string[] = [];
      for (let i = 1; i <= validCount; i++) {
        if (prioritySet.has(i)) {
          list.push(`Absen ${i} [Prioritas]`);
        } else {
          list.push(`Absen ${i}`);
        }
      }

      const newText = list.join('\n');
      setStudentsText(newText);

      // Auto-adjust rows & cols if capacity is insufficient
      let newRows = config.rows;
      let newCols = config.cols;
      if (newRows * newCols < validCount) {
        if (config.arrangement === '2-2') {
          if (validCount <= 24) {
            newRows = 4;
            newCols = 6;
          } else if (validCount <= 30) {
            newRows = 5;
            newCols = 6;
          } else if (validCount <= 36) {
            newRows = 5;
            newCols = 8;
          } else {
            newRows = 6;
            newCols = 8;
          }
        } else {
          if (validCount <= 25) {
            newRows = 5;
            newCols = 5;
          } else if (validCount <= 36) {
            newRows = 6;
            newCols = 6;
          } else {
            newRows = 6;
            newCols = 7;
          }
        }
      }

      const nextConfig = {
        ...config,
        rows: newRows,
        cols: newCols,
        prioritizeMinusInFront: true,
      };

      setConfigState(nextConfig);
      setSeats(
        distributeStudents(
          list,
          generateEmptySeats(newRows, newCols, nextConfig.arrangement),
          nextConfig,
          false
        )
      );
    },
    [config, recordHistory]
  );

  // Toggle priority status for a specific attendance number
  const toggleStudentPriority = useCallback(
    (targetAbsenNo: number) => {
      recordHistory(`Ubah status prioritas Absen ${targetAbsenNo}`);
      const updatedLines = studentsRaw.map((line, idx) => {
        const parsed = parseStudentLine(line, idx);
        const absenNo = parsed.absenNo || idx + 1;
        if (absenNo === targetAbsenNo) {
          if (parsed.isPriorityFront) {
            // Remove priority/minus tag
            return line.replace(/\[(prioritas|depan|minus|kacamata|mines)\]|\((prioritas|depan|minus|kacamata|mines)\)|\b(prioritas|depan|minus|kacamata|mines)\b/gi, '').trim();
          } else {
            // Add priority tag
            return `${line} [Prioritas]`;
          }
        }
        return line;
      });

      const newText = updatedLines.join('\n');
      setStudentsText(newText);
      setSeats((curr) => distributeStudents(updatedLines, curr, config, false));
    },
    [studentsRaw, config, recordHistory]
  );

  // Set multiple priority attendance numbers from string
  const setPriorityFromListStr = useCallback(
    (priorityStr: string) => {
      const parts = priorityStr.split(/[\s,;+]+/);
      const targetNumbers = new Set<number>();
      parts.forEach((p) => {
        const n = parseInt(p.trim(), 10);
        if (!isNaN(n)) targetNumbers.add(n);
      });

      const updatedLines = studentsRaw.map((line, idx) => {
        const parsed = parseStudentLine(line, idx);
        const absenNo = parsed.absenNo || idx + 1;
        const cleanBase = line.replace(/\[(prioritas|depan|minus|kacamata|mines)\]|\((prioritas|depan|minus|kacamata|mines)\)|\b(prioritas|depan|minus|kacamata|mines)\b/gi, '').trim();
        if (targetNumbers.has(absenNo)) {
          return `${cleanBase} [Prioritas]`;
        }
        return cleanBase;
      });

      const newText = updatedLines.join('\n');
      setStudentsText(newText);
      setSeats((curr) => distributeStudents(updatedLines, curr, config, false));
    },
    [studentsRaw, config]
  );

  // Primary Randomizer / Shuffle
  const shuffleSeats = useCallback(() => {
    recordHistory('Acak Tempat Duduk');
    setIsShuffling(true);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#2563eb', '#eab308', '#ef4444', '#3b82f6'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }

    setSeats((currSeats) => distributeStudents(studentsRaw, currSeats, config, true));

    setTimeout(() => {
      setIsShuffling(false);
    }, 450);
  }, [studentsRaw, config, recordHistory]);

  // Toggle Pin for a seat
  const handleTogglePin = useCallback(
    (seatId: string) => {
      setSeats((curr) => togglePin(seatId, curr));
    },
    []
  );

  // Click-to-swap mechanic
  const handleSelectOrSwap = useCallback(
    (seatId: string) => {
      if (!selectedSeatForSwap) {
        setSelectedSeatForSwap(seatId);
      } else if (selectedSeatForSwap === seatId) {
        setSelectedSeatForSwap(null);
      } else {
        recordHistory('Tukar Posisi Meja');
        setSeats((curr) => swapSeatPositions(selectedSeatForSwap, seatId, curr));
        setSelectedSeatForSwap(null);
      }
    },
    [selectedSeatForSwap, recordHistory]
  );

  // Load Preset
  const loadPreset = useCallback(
    (presetId: string) => {
      const preset = PRESET_ROSTERS.find((p) => p.id === presetId);
      if (!preset) return;

      recordHistory(`Muat template "${preset.name}"`);
      const newText = preset.students.join('\n');
      setStudentsText(newText);

      const nextConfig: ClassroomConfig = {
        ...config,
        title: preset.recommendedConfig?.title || preset.name,
        teacherName: preset.recommendedConfig?.teacherName || config.teacherName,
        roomNumber: preset.recommendedConfig?.roomNumber || config.roomNumber,
        rows: preset.recommendedConfig?.rows || config.rows,
        cols: preset.recommendedConfig?.cols || config.cols,
        arrangement: preset.recommendedConfig?.arrangement || config.arrangement,
        prioritizeMinusInFront: true,
      };

      setConfigState(nextConfig);
      setSeats(
        distributeStudents(
          preset.students,
          generateEmptySeats(nextConfig.rows, nextConfig.cols, nextConfig.arrangement),
          nextConfig,
          false
        )
      );
    },
    [config, recordHistory]
  );

  // Quick Generate Absen Only
  const generateAbsenOnly = useCallback(
    (count: number = 30) => {
      generateAbsenFromCount(count, '1, 4, 9, 15');
    },
    [generateAbsenFromCount]
  );

  // Clear Roster
  const clearRoster = useCallback(() => {
    recordHistory('Kosongkan Daftar Siswa');
    setStudentsText('');
    setSeats((curr) =>
      curr.map((s) => ({
        ...s,
        studentName: null,
        absenNo: undefined,
        hasMinus: undefined,
        isPriorityFront: undefined,
        isEmpty: true,
        isPinned: false,
      }))
    );
  }, [recordHistory]);

  // Alphabetize Roster
  const alphabetizeRoster = useCallback(() => {
    const parsed = studentsRaw
      .map((line, idx) => parseStudentLine(line, idx))
      .filter((s) => s.name.length > 0);
    parsed.sort((a, b) => a.name.localeCompare(b.name));
    const formatted = parsed.map((s, idx) => {
      const priorityTag = s.isPriorityFront ? (s.hasMinus ? ' [Minus]' : ' [Prioritas]') : '';
      return `${idx + 1}. ${s.name}${priorityTag}`;
    });
    setStudentsText(formatted.join('\n'));
  }, [studentsRaw]);

  // Sort by Absen Number
  const sortByAbsen = useCallback(() => {
    const parsed = studentsRaw
      .map((line, idx) => parseStudentLine(line, idx))
      .filter((s) => s.name.length > 0);
    parsed.sort((a, b) => (a.absenNo || 999) - (b.absenNo || 999));
    const formatted = parsed.map((s, idx) => {
      const num = s.absenNo || idx + 1;
      const priorityTag = s.isPriorityFront ? (s.hasMinus ? ' [Minus]' : ' [Prioritas]') : '';
      return `${num}. ${s.name}${priorityTag}`;
    });
    setStudentsText(formatted.join('\n'));
  }, [studentsRaw]);

  // Add sample priority tags
  const addExampleMinusTags = useCallback(() => {
    const lines = studentsRaw.map((line, idx) => {
      if (idx === 0 || idx === 3 || idx === 8 || idx === 14) {
        if (!/minus|kacamata|prioritas|depan/i.test(line)) {
          return `${line} [Prioritas]`;
        }
      }
      return line;
    });
    setStudentsText(lines.join('\n'));
  }, [studentsRaw]);

  // Undo
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    setFuture((prev) => [
      {
        seats: JSON.parse(JSON.stringify(seats)),
        description: 'Status sesudahnya',
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    setSeats(previous.seats);
    setHistory(newHistory);
    setSelectedSeatForSwap(null);
  }, [history, seats]);

  // Redo
  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setHistory((prev) => [
      ...prev,
      {
        seats: JSON.parse(JSON.stringify(seats)),
        description: 'Status sebelumnya',
        timestamp: Date.now(),
      },
    ]);

    setSeats(next.seats);
    setFuture(newFuture);
    setSelectedSeatForSwap(null);
  }, [future, seats]);

  // Handle student raw text change
  const handleStudentsTextChange = useCallback(
    (text: string) => {
      setStudentsText(text);
      const lines = text
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      setSeats((curr) => distributeStudents(lines, curr, config, false));
    },
    [config]
  );

  return {
    config,
    setConfig,
    setArrangement,
    setDimensions,
    studentsText,
    setStudentsText: handleStudentsTextChange,
    students: studentsRaw,
    parsedStudents,
    priorityAbsenSet,
    seats,
    setSeats,
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
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    isShuffling,
    stats,
  };
}
