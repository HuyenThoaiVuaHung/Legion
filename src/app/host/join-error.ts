import { HttpErrorResponse } from '@angular/common/http';

export function joinError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Kh?ng th? k?t n?i t?i m?y ch?.';
  const message = error.error?.error ?? '';
  if (error.status === 400 && /username/i.test(message)) return 'Vui l?ng nh?p t?n ng??i ch?i (1?32 k? t?).';
  if (error.status === 400) return 'Th?ng tin v?o ph?ng kh?ng h?p l?.';
  if (error.status === 401) return 'M?t m? ho?c li?n k?t kh?ng ??ng, ?? h?t h?n ho?c ph?ng y?u c?u m?t m? kh?n gi?.';
  if (error.status === 403) return 'Ph?ng kh?ng cho ph?p kh?n gi? tham gia.';
  if (error.status === 404) return 'Kh?ng t?m th?y ph?ng v?i m? n?y.';
  if (error.status === 409) return 'T?n ?? ???c s? d?ng ho?c ph?ng ?? h?t ch? ch?i.';
  if (error.status === 423) return 'Tr?n ??u ?ang di?n ra, kh?ng th? nh?n ch? m?i.';
  if (error.status === 429) return 'Qu? nhi?u l?n th?. Vui l?ng th? l?i sau.';
  return 'Kh?ng th? v?o ph?ng. Vui l?ng th? l?i.';
}
