export type DeskArrangement = '1-1' | '2-2';

export type EmptySeatStrategy = 'random' | 'back' | 'front' | 'sides';

export type FrontPosition = 'top' | 'bottom';

export type TeacherDeskPosition = 'top-left' | 'top-right' | 'top-center';

export type StudentDisplayMode = 'absen-primary' | 'absen-only' | 'name-primary';

export interface ParsedStudent {
  originalRaw: string;
  name: string;
  absenNo?: number;
  hasMinus: boolean;
  isPriorityFront: boolean;
}

export interface Seat {
  id: string;
  row: number;
  col: number;
  label: string;
  seatNumber: number;
  studentName: string | null;
  absenNo?: number;
  hasMinus?: boolean;
  isPriorityFront?: boolean;
  isPinned: boolean;
  isEmpty: boolean;
  pairGroup?: number;
  pairSide?: 'left' | 'right';
}

export interface ClassroomConfig {
  title: string;
  teacherName: string;
  roomNumber: string;
  date: string;
  arrangement: DeskArrangement;
  rows: number;
  cols: number;
  emptyStrategy: EmptySeatStrategy;
  frontPosition: FrontPosition;
  teacherDeskPosition: TeacherDeskPosition;
  showSeatNumbers: boolean;
  showInitials: boolean;
  showAisleMarkers: boolean;
  prioritizeMinusInFront: boolean;
  displayMode: StudentDisplayMode;
}

export interface HistoryState {
  seats: Seat[];
  description: string;
  timestamp: number;
}

export interface PresetRoster {
  id: string;
  name: string;
  category: string;
  students: string[];
  recommendedConfig?: Partial<ClassroomConfig>;
}
