import { STORAGE_KEYS } from '../../core/constants';
import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

const MIN_PANEL_PX = 200;
const KEY_STEP_PX = 24;

/** Turns a flex container's children into resizable panels, with a draggable separator between each pair. */
@Directive({ selector: '[appResizeGroup]' })
export class ResizeGroupDirective implements AfterViewInit, OnDestroy {
  readonly direction = input<'' | 'row' | 'column'>('row', { alias: 'appResizeGroup' });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private handles: HTMLElement[] = [];
  private storageKey = '';

  private restore(panels: HTMLElement[]): void {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null');
      if (!Array.isArray(saved) || saved.length !== panels.length || !saved.every((n) => typeof n === 'number' && n > 0)) return;
      panels.forEach((panel, i) => (panel.style.flex = `${saved[i]} 1 0`));
    } catch { localStorage.removeItem(this.storageKey); }
  }

  private persist(panels: HTMLElement[]): void {
    const weights = panels.map((p) => parseFloat(p.style.flex));
    const total = weights.reduce((sum, w) => sum + w, 0);
    if (weights.some((w) => !(w > 0))) return;
    localStorage.setItem(this.storageKey, JSON.stringify(weights.map((w) => +(w / total * 100).toFixed(3))));
  }

  ngAfterViewInit(): void {
    const column = this.direction() === 'column';
    const panels = Array.from(this.host.children).filter((el): el is HTMLElement => el instanceof HTMLElement && el.tagName !== 'ROUTER-OUTLET');
    this.storageKey = STORAGE_KEYS.panelSizesPrefix + location.pathname.split('/').filter(Boolean).pop() + (column ? ':column' : '');
    this.restore(panels);
    panels.forEach((panel, i) => {
      panel.style.minWidth = '0';
      panel.style.minHeight = '0';
      if (i === 0) return;
      const handle = document.createElement('div');
      handle.className = `split-handle split-handle-${column ? 'row' : 'column'}`;
      handle.setAttribute('role', 'separator');
      handle.setAttribute('aria-orientation', column ? 'horizontal' : 'vertical');
      handle.tabIndex = 0;
      handle.addEventListener('pointerdown', (event) => this.drag(event, handle, panels, i, column));
      handle.addEventListener('keydown', (event) => this.key(event, panels, i, column));
      handle.addEventListener('dblclick', () => {
        panels.forEach((p) => (p.style.flex = ''));
        localStorage.removeItem(this.storageKey);
      });
      panel.before(handle);
      this.handles.push(handle);
    });
  }

  ngOnDestroy(): void {
    this.handles.forEach((handle) => handle.remove());
  }

  private size(panel: HTMLElement, column: boolean): number {
    const rect = panel.getBoundingClientRect();
    return column ? rect.height : rect.width;
  }

  private freeze(panels: HTMLElement[], column: boolean): void {
    for (const panel of panels) panel.style.flex = `${this.size(panel, column)} 1 0`;
  }

  private shift(panels: HTMLElement[], index: number, column: boolean, delta: number): void {
    const before = panels[index - 1];
    const after = panels[index];
    const beforeSize = parseFloat(before.style.flex);
    const afterSize = parseFloat(after.style.flex);
    const clamped = Math.max(MIN_PANEL_PX - beforeSize, Math.min(afterSize - MIN_PANEL_PX, delta));
    before.style.flex = `${beforeSize + clamped} 1 0`;
    after.style.flex = `${afterSize - clamped} 1 0`;
  }

  private drag(event: PointerEvent, handle: HTMLElement, panels: HTMLElement[], index: number, column: boolean): void {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.classList.add('dragging');
    this.freeze(panels, column);
    const start = column ? event.clientY : event.clientX;
    const origin = panels.map((p) => p.style.flex);
    const move = (e: PointerEvent): void => {
      panels.forEach((p, i) => (p.style.flex = origin[i]));
      this.shift(panels, index, column, (column ? e.clientY : e.clientX) - start);
    };
    const end = (): void => {
      this.persist(panels);
      handle.classList.remove('dragging');
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  private key(event: KeyboardEvent, panels: HTMLElement[], index: number, column: boolean): void {
    const grow = column ? 'ArrowDown' : 'ArrowRight';
    const shrink = column ? 'ArrowUp' : 'ArrowLeft';
    if (event.key !== grow && event.key !== shrink) return;
    event.preventDefault();
    this.freeze(panels, column);
    this.shift(panels, index, column, event.key === grow ? KEY_STEP_PX : -KEY_STEP_PX);
    this.persist(panels);
  }
}
