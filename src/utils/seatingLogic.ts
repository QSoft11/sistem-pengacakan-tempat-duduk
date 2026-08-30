import {
  Seat,
  ClassroomConfig,
  DeskArrangement,
  ParsedStudent,
} from '../types/seating';

export function getRowLetter(rowIndex: number): string {
  let letter = '';
  let temp = rowIndex;
  while (temp >= 0) {
    letter = String.fromCharCode(65 + (temp % 26)) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function parseStudentLine(raw: string, index: number = 0): ParsedStudent {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      originalRaw: '',
      name: '',
      hasMinus: false,
      isPriorityFront: false,
    };
  }

  // Check for minus/kacamata/prioritas tags
  const minusRegex = /\[(minus|kacamata|mines)\]|\((minus|kacamata|mines)\)|\b(minus|kacamata|mines)\b/i;
  const priorityRegex = /\[(prioritas|depan|khusus)\]|\((prioritas|depan|khusus)\)|\b(prioritas|depan|khusus)\b/i;

  const hasMinus = minusRegex.test(trimmed);
  const hasPriorityTag = priorityRegex.test(trimmed);
  const isPriorityFront = hasMinus || hasPriorityTag;

  // Remove tags from raw string
  let cleanName = trimmed
    .replace(minusRegex, '')
    .replace(priorityRegex, '')
    .trim();

  let absenNo: number | undefined;

  // Case 1: Format like "Absen 17: Budi Santoso" or "Absen 17 - Budi"
  const absenWithNameMatch = cleanName.match(/^absen[\s\.\:\-]*(\d+)[\s\.\:\-]+(.+)$/i);
  // Case 2: Format like "1. Budi Santoso" or "01 - Budi Santoso" or "1) Budi"
  const prefixNumberMatch = cleanName.match(/^(\d+)[\.\)\-\:\s]+\s*(.+)$/i);
  // Case 3: Format like "Absen 17" or "Absen: 17"
  const onlyAbsenMatch = cleanName.match(/^absen[\s\.\:\-]*(\d+)$/i);
  // Case 4: Format like pure number "17"
  const onlyNumberMatch = cleanName.match(/^(\d+)$/);

  if (absenWithNameMatch) {
    absenNo = parseInt(absenWithNameMatch[1], 10);
    cleanName = absenWithNameMatch[2].trim();
  } else if (prefixNumberMatch && !/^\d+$/.test(prefixNumberMatch[2])) {
    absenNo = parseInt(prefixNumberMatch[1], 10);
    cleanName = prefixNumberMatch[2].trim();
  } else if (onlyAbsenMatch) {
    absenNo = parseInt(onlyAbsenMatch[1], 10);
    cleanName = `Absen ${absenNo}`;
  } else if (onlyNumberMatch) {
    absenNo = parseInt(onlyNumberMatch[1], 10);
    cleanName = `Absen ${absenNo}`;
  } else {
    // Plain name (e.g. "Budi Santoso")
    absenNo = index + 1;
  }

  cleanName = cleanName.replace(/^[,\s\-\–\:\.]+|[,\s\-\–\:\.]+$/g, '').trim();

  return {
    originalRaw: trimmed,
    name: cleanName,
    absenNo,
    hasMinus,
    isPriorityFront,
  };
}

export function generateEmptySeats(
  rows: number,
  cols: number,
  arrangement: DeskArrangement
): Seat[] {
  const seats: Seat[] = [];
  let seatNumber = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rowLetter = getRowLetter(r);
      const label = `${rowLetter}${c + 1}`;
      const pairGroup = Math.floor(c / 2);
      const pairSide = c % 2 === 0 ? 'left' : 'right';

      seats.push({
        id: `seat-r${r}-c${c}`,
        row: r,
        col: c,
        label,
        seatNumber,
        studentName: null,
        isPinned: false,
        isEmpty: true,
        pairGroup,
        pairSide,
      });
      seatNumber++;
    }
  }

  return seats;
}

export function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function distributeStudents(
  studentsRaw: string[],
  currentSeats: Seat[],
  config: ClassroomConfig,
  shouldShuffle: boolean = true
): Seat[] {
  const { rows, cols, arrangement, emptyStrategy, frontPosition, prioritizeMinusInFront } = config;

  // Parse all raw student strings
  const parsedStudents = studentsRaw
    .map((line, idx) => parseStudentLine(line, idx))
    .filter((s) => s.name.length > 0);

  const studentNameMap = new Map<string, ParsedStudent>();
  parsedStudents.forEach((s) => {
    studentNameMap.set(s.name, s);
  });

  // Initialize base grid for required rows x cols
  const baseGrid = generateEmptySeats(rows, cols, arrangement);

  // Map existing pinned seats from current state if within bounds
  const currentSeatMap = new Map<string, Seat>();
  currentSeats.forEach((seat) => {
    currentSeatMap.set(seat.id, seat);
  });

  // Identify pinned seats with valid student names
  const pinnedStudentNames = new Set<string>();
  const pinnedSeatIds = new Set<string>();

  const newSeats: Seat[] = baseGrid.map((baseSeat) => {
    const existing = currentSeatMap.get(baseSeat.id);
    if (
      existing &&
      existing.isPinned &&
      existing.studentName &&
      studentNameMap.has(existing.studentName)
    ) {
      const studentInfo = studentNameMap.get(existing.studentName)!;
      pinnedStudentNames.add(existing.studentName);
      pinnedSeatIds.add(baseSeat.id);
      return {
        ...baseSeat,
        studentName: existing.studentName,
        absenNo: studentInfo.absenNo,
        hasMinus: studentInfo.hasMinus,
        isPriorityFront: studentInfo.isPriorityFront,
        isPinned: true,
        isEmpty: false,
      };
    }
    return baseSeat;
  });

  // Students that need to be assigned
  const unassignedStudents = parsedStudents.filter(
    (s) => !pinnedStudentNames.has(s.name)
  );

  // Unpinned seat slots
  const unpinnedSeats = newSeats.filter((s) => !pinnedSeatIds.has(s.id));
  const totalUnpinnedSeats = unpinnedSeats.length;
  const neededSeats = unassignedStudents.length;

  if (neededSeats === 0) {
    return newSeats.map((seat) => {
      if (pinnedSeatIds.has(seat.id)) return seat;
      return {
        ...seat,
        studentName: null,
        absenNo: undefined,
        hasMinus: undefined,
        isPriorityFront: undefined,
        isEmpty: true,
      };
    });
  }

  // Determine active seats vs empty seats
  let activeSeatsList: Seat[] = [];

  if (neededSeats >= totalUnpinnedSeats) {
    activeSeatsList = [...unpinnedSeats];
  } else {
    const sortedCandidates = [...unpinnedSeats];

    if (emptyStrategy === 'back') {
      sortedCandidates.sort((a, b) => {
        const rowDiff = frontPosition === 'top' ? a.row - b.row : b.row - a.row;
        if (rowDiff !== 0) return rowDiff;
        return a.col - b.col;
      });
      activeSeatsList = sortedCandidates.slice(0, neededSeats);
    } else if (emptyStrategy === 'front') {
      sortedCandidates.sort((a, b) => {
        const rowDiff = frontPosition === 'top' ? b.row - a.row : a.row - b.row;
        if (rowDiff !== 0) return rowDiff;
        return a.col - b.col;
      });
      activeSeatsList = sortedCandidates.slice(0, neededSeats);
    } else if (emptyStrategy === 'sides') {
      const midCol = (cols - 1) / 2;
      sortedCandidates.sort((a, b) => {
        const distA = Math.abs(a.col - midCol);
        const distB = Math.abs(b.col - midCol);
        if (distA !== distB) return distA - distB;
        return a.row - b.row;
      });
      activeSeatsList = sortedCandidates.slice(0, neededSeats);
    } else {
      if (shouldShuffle) {
        const shuffled = fisherYatesShuffle(unpinnedSeats);
        activeSeatsList = shuffled.slice(0, neededSeats);
      } else {
        activeSeatsList = unpinnedSeats.slice(0, neededSeats);
      }
    }
  }

  // Separate Priority Students vs Regular Students
  const priorityStudents = unassignedStudents.filter((s) => s.isPriorityFront);
  const regularStudents = unassignedStudents.filter((s) => !s.isPriorityFront);

  const shuffledPriority = shouldShuffle
    ? fisherYatesShuffle(priorityStudents)
    : [...priorityStudents];
  const shuffledRegular = shouldShuffle
    ? fisherYatesShuffle(regularStudents)
    : [...regularStudents];

  const seatAssignments = new Map<string, ParsedStudent>();

  if (prioritizeMinusInFront && shuffledPriority.length > 0) {
    // Sort active seats prioritizing frontmost rows (Row 0: A1, A2, A3... then Row 1: B1, B2...)
    const frontPrioritySeats = [...activeSeatsList].sort((a, b) => {
      const rowDiff = frontPosition === 'top' ? a.row - b.row : b.row - a.row;
      if (rowDiff !== 0) return rowDiff;
      return a.col - b.col;
    });

    let pIdx = 0;
    const remainingSeatsForRegular: Seat[] = [];

    frontPrioritySeats.forEach((seat) => {
      if (pIdx < shuffledPriority.length) {
        seatAssignments.set(seat.id, shuffledPriority[pIdx++]);
      } else {
        remainingSeatsForRegular.push(seat);
      }
    });

    const shuffledRemainingSeats = shouldShuffle
      ? fisherYatesShuffle(remainingSeatsForRegular)
      : remainingSeatsForRegular;

    let rIdx = 0;
    shuffledRemainingSeats.forEach((seat) => {
      if (rIdx < shuffledRegular.length) {
        seatAssignments.set(seat.id, shuffledRegular[rIdx++]);
      }
    });
  } else {
    const allStudents = shouldShuffle
      ? fisherYatesShuffle(unassignedStudents)
      : unassignedStudents;

    let idx = 0;
    activeSeatsList.forEach((seat) => {
      if (idx < allStudents.length) {
        seatAssignments.set(seat.id, allStudents[idx++]);
      }
    });
  }

  return newSeats.map((seat) => {
    if (pinnedSeatIds.has(seat.id)) {
      return seat;
    }

    const assigned = seatAssignments.get(seat.id);
    if (assigned) {
      return {
        ...seat,
        studentName: assigned.name,
        absenNo: assigned.absenNo,
        hasMinus: assigned.hasMinus,
        isPriorityFront: assigned.isPriorityFront,
        isEmpty: false,
        isPinned: false,
      };
    }

    return {
      ...seat,
      studentName: null,
      absenNo: undefined,
      hasMinus: undefined,
      isPriorityFront: undefined,
      isEmpty: true,
      isPinned: false,
    };
  });
}

export function swapSeatPositions(
  seatIdA: string,
  seatIdB: string,
  currentSeats: Seat[]
): Seat[] {
  const seatA = currentSeats.find((s) => s.id === seatIdA);
  const seatB = currentSeats.find((s) => s.id === seatIdB);

  if (!seatA || !seatB || seatIdA === seatIdB) {
    return currentSeats;
  }

  return currentSeats.map((seat) => {
    if (seat.id === seatIdA) {
      return {
        ...seat,
        studentName: seatB.studentName,
        absenNo: seatB.absenNo,
        hasMinus: seatB.hasMinus,
        isPriorityFront: seatB.isPriorityFront,
        isEmpty: seatB.isEmpty,
        isPinned: seatB.isPinned,
      };
    }
    if (seat.id === seatIdB) {
      return {
        ...seat,
        studentName: seatA.studentName,
        absenNo: seatA.absenNo,
        hasMinus: seatA.hasMinus,
        isPriorityFront: seatA.isPriorityFront,
        isEmpty: seatA.isEmpty,
        isPinned: seatA.isPinned,
      };
    }
    return seat;
  });
}

export function togglePin(seatId: string, currentSeats: Seat[]): Seat[] {
  return currentSeats.map((seat) => {
    if (seat.id === seatId && !seat.isEmpty && seat.studentName) {
      return {
        ...seat,
        isPinned: !seat.isPinned,
      };
    }
    return seat;
  });
}
