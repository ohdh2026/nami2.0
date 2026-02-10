
import { Ship, Role } from './types';

export const SHIPS: Ship[] = [
  { id: 'ship-1', name: "탐나라호", capacity: 300 },
  { id: 'ship-2', name: "아일래나호", capacity: 200 },
  { id: 'ship-3', name: "가우디호", capacity: 100 },
  { id: 'ship-4', name: "인어공주호", capacity: 100 }
];

export const ROLES: Role[] = ["선장", "기관장", "관리자", "승무원"];

export const COLORS = {
  primary: 'sky-600',
  primaryHover: 'sky-700',
  secondary: 'slate-900',
  danger: 'rose-600',
  success: 'emerald-500',
  warning: 'amber-500'
};
