import { MatchPosition } from './contracts/game';

/** localStorage keys — the only place they may appear. */
export const STORAGE_KEYS = {
  serverUrl: 'legion.serverUrl',
  authToken: 'legion.authToken',
} as const;

/** Where each match position sends a player/viewer. */
export const PLAYER_ROUTE_BY_POSITION: Readonly<Record<MatchPosition, string>> = {
  H: '/',
  KD: '/player/kd',
  VCNV_Q: '/player/vcnv-q',
  VCNV_A: '/player/vcnv-a',
  TT_Q: '/player/tangtoc-q',
  TT_A: '/player/tangtoc-a',
  VD: '/player/vd',
  CHP: '/player/chp',
  PNTS: '/player/points',
};

/** Where each match position sends the admin control panel. */
export const ADMIN_ROUTE_BY_POSITION: Readonly<Record<MatchPosition, string>> = {
  H: '/admin',
  KD: '/admin/kd',
  VCNV_Q: '/admin/vcnv',
  VCNV_A: '/admin/vcnv',
  TT_Q: '/admin/tt',
  TT_A: '/admin/tt',
  VD: '/admin/vd',
  CHP: '/admin/chp',
  PNTS: '/admin',
};

/** Vietnamese display names for match positions. */
export const POSITION_LABELS: Readonly<Record<MatchPosition, string>> = {
  H: 'Trang chủ',
  KD: 'Khởi động',
  VCNV_Q: 'Vượt chướng ngại vật — Câu hỏi',
  VCNV_A: 'Vượt chướng ngại vật — Trả lời',
  TT_Q: 'Tăng tốc — Câu hỏi',
  TT_A: 'Tăng tốc — Trả lời',
  VD: 'Về đích',
  CHP: 'Câu hỏi phụ',
  PNTS: 'Điểm',
};

export const SNACKBAR_DURATION_MS = 5000;
