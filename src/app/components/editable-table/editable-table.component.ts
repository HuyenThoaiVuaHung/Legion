import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, TemplateRef, computed, contentChildren, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EditableComponent, EditableFocusDirective, EditModeDirective, ViewModeDirective } from '@ngneat/edit-in-place';

/** One column: plain text, or click-to-edit text/number when `edit` is set. A custom cell template overrides both. */
export interface TableColumn {
  key: string;
  label: string;
  /** Relative width, default 1. */
  flex?: number;
  edit?: 'text' | 'number';
  /** Click the header to sort by this column. */
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
}

export interface CellEdit<T> {
  row: T;
  index: number;
  key: string;
  value: string | number;
}

/** Custom cell content for a column: `<ng-template tableCell="mark" let-row let-i="index">`. */
@Directive({ selector: 'ng-template[tableCell]' })
export class TableCellDirective {
  readonly key = input.required<string>({ alias: 'tableCell' });
  readonly template = inject(TemplateRef);
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), 'vi', { numeric: true });
}

/** Editor-style table: header bar, one rounded row per record, click a cell to edit it in place. */
@Component({
  selector: 'editable-table',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgTemplateOutlet, FormsModule, MatIcon, MatFormFieldModule, MatInputModule, EditableComponent, EditableFocusDirective, EditModeDirective, ViewModeDirective],
  template: `
    <div class="table-header sticky top-0 z-10 w-full mb-2 px-5 rounded-xl box-border h-12 flex flex-row items-center" role="row">
      @for (col of columns(); track col.key; let ci = $index; let last = $last) {
        <div class="head-cell flex items-center min-w-0 relative self-stretch px-4" [style.flex]="flexOf(col)" [style.justify-content]="justify(col)">
          @if (col.sortable) {
            <button type="button" class="sort-head flex items-center gap-1 min-w-0" (click)="toggleSort(col.key)" role="columnheader" [attr.aria-sort]="ariaSort(col.key)">
              <span>{{ col.label }}</span>
              <mat-icon class="sort-icon" [class.active]="sortKey() === col.key">{{ sortKey() === col.key && sortDir() === 'desc' ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
            </button>
          } @else {
            <div class="flex items-center min-w-0" role="columnheader">{{ col.label }}</div>
          }
          @if (!last && (resizable() || separators())) {
            <span class="resize-handle" [class.static]="!resizable()" [class.quiet]="!separators()" role="separator" aria-orientation="vertical" aria-label="Kéo để đổi độ rộng cột" (pointerdown)="startResize($event, ci)" (pointermove)="moveResize($event)" (pointerup)="endResize($event)" (pointercancel)="endResize($event)" (click)="$event.stopPropagation()"></span>
          }
        </div>
      }
    </div>
    @for (entry of view(); track entry.index; let i = $index) {
      @let row = entry.row;
      <div
        class="table-item item-shadow w-full mb-2 px-5 py-0 rounded-xl box-border min-h-14 flex flex-row items-center"
        [class.table-item-color]="row === selected()"
        [class.clickable]="rowClickable"
        role="row"
        [attr.tabindex]="rowClickable ? 0 : null"
        (click)="rowClick.emit(row)"
        (keydown.enter)="$event.target === $event.currentTarget && rowClick.emit(row)"
        (dblclick)="rowDblClick.emit(row)"
      >
        @for (col of columns(); track col.key) {
          <div class="flex items-center min-w-0 self-stretch px-4 py-2" [style.flex]="flexOf(col)" [style.justify-content]="justify(col)" [style.text-align]="col.align ?? 'start'" role="cell">
            @if (templateFor(col.key); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: row, index: entry.index }" />
            } @else if (col.edit) {
              <editable #ed class="w-full" openBindingEvent="dblclick" (dblclick)="$event.stopPropagation()" (modeChange)="$event === 'edit' && begin(row, col)" (save)="commit(row, entry.index, col)">
                <ng-template viewMode><span class="view" [class.placeholder]="text(row, col) === ''" title="Nhấp đúp để sửa">{{ text(row, col) === '' ? 'Nhấp đúp để nhập.' : text(row, col) }}</span></ng-template>
                <ng-template editMode>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                    @if (col.edit === 'number') {
                      <input matInput type="number" editableFocusable (keydown.enter)="$event.preventDefault(); ed.saveEdit()" (keydown.escape)="ed.cancelEdit()" (blur)="ed.editMode() && ed.saveEdit()" [ngModel]="draft()" (ngModelChange)="draft.set($event)" />
                    } @else {
                      <textarea matInput editableFocusable (keydown.enter)="$event.preventDefault(); ed.saveEdit()" (keydown.escape)="ed.cancelEdit()" (blur)="ed.editMode() && ed.saveEdit()" [ngModel]="draft()" (ngModelChange)="draft.set($event)"></textarea>
                    }
                  </mat-form-field>
                </ng-template>
              </editable>
            } @else {
              <span class="min-w-0 break-words">{{ text(row, col) }}</span>
            }
          </div>
        }
      </div>
    } @empty {
      <div class="table-item w-full mb-2 px-5 rounded-xl box-border min-h-14 flex items-center gap-2 empty"><mat-icon>table_rows</mat-icon>Chưa có dữ liệu.</div>
    }
  `,
  styles: `
    :host { display: block; padding: 16px 0; }
    .table-item { background: var(--mat-sys-surface-container-low); color: var(--mat-sys-on-surface); transition: background-color 120ms; }
    .table-item.clickable { cursor: pointer; }
    .table-item.clickable:hover { background: color-mix(in srgb, var(--mat-sys-on-surface) 8%, var(--mat-sys-surface-container-low)); }
    .table-item.table-item-color, .table-item.table-item-color:hover { background: var(--mat-sys-secondary-container); }
    .table-item:focus-visible, .sort-head:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: -2px; }
    .view { display: block; padding: 4px 8px; margin: -4px -8px; border-radius: 8px; user-select: none; cursor: text; transition: background-color 120ms; }
    editable:hover .view { background: var(--mat-sys-surface-container-highest); }
    .placeholder { color: var(--mat-sys-on-surface-variant); font-style: italic; }
    .empty { color: var(--mat-sys-on-surface-variant); }
    .resize-handle { position: absolute; top: 0; bottom: 0; right: -6px; width: 12px; cursor: col-resize; touch-action: none; z-index: 1; }
    .resize-handle::after { content: ''; position: absolute; top: 25%; bottom: 25%; left: 5px; width: 2px; border-radius: 1px; background: var(--mat-sys-outline); opacity: 0.3; transition: opacity 120ms, background-color 120ms; }
    .resize-handle.quiet::after { opacity: 0; }
    .resize-handle.static { pointer-events: none; cursor: default; }
    .resize-handle:hover::after, .resize-handle.active::after { opacity: 1; background: var(--mat-sys-primary); }
        .sort-head { background: none; border: 0; padding: 0; color: inherit; font: inherit; letter-spacing: inherit; cursor: pointer; }
    .sort-icon { width: 18px; height: 18px; font-size: 18px; opacity: 0; transition: opacity 120ms; }
    .sort-head:hover .sort-icon { opacity: 0.5; }
    .sort-head .sort-icon.active { opacity: 1; color: var(--mat-sys-primary); }
  `,
})
export class EditableTableComponent<T extends object> {
  readonly rows = input.required<readonly T[]>();
  readonly columns = input.required<readonly TableColumn[]>();
  readonly selected = input<T | null>(null);
  /** Show draggable column separators in the header. */
  readonly resizable = input(true);
  /** Show a faint line between header columns at rest; when false it only appears on hover while resizing. */
  readonly separators = input(true);
  readonly cellSave = output<CellEdit<T>>();
  readonly rowClick = output<T>();
  readonly rowDblClick = output<T>();
  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');
  /** Rows in display order; `index` is the position in the input so edits stay addressed to the source row. */
  protected readonly view = computed(() => {
    const entries = this.rows().map((row, index) => ({ row, index }));
    const key = this.sortKey();
    if (!key) return entries;
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return entries.sort((a, b) => dir * compare((a.row as Record<string, unknown>)[key], (b.row as Record<string, unknown>)[key]));
  });
  protected readonly rowClickable = true;

  private readonly cells = contentChildren(TableCellDirective);
  protected readonly draft = signal<string | number>('');

  protected toggleSort(key: string): void {
    if (this.sortKey() !== key) { this.sortKey.set(key); this.sortDir.set('asc'); }
    else if (this.sortDir() === 'asc') this.sortDir.set('desc');
    else this.sortKey.set(null);
  }
  protected ariaSort(key: string): string | null {
    return this.sortKey() === key ? (this.sortDir() === 'asc' ? 'ascending' : 'descending') : null;
  }
  protected justify(col: TableColumn): string {
    return col.align === 'end' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start';
  }
  protected flexOf(col: TableColumn): string {
    return `${this.widths()[col.key] ?? col.flex ?? 1} 1 0`;
  }

  /** Dragged widths in px, used as flex-grow so the row still fills the container. Empty until the first drag. */
  protected readonly widths = signal<Record<string, number>>({});
  private drag: { pointerId: number; x: number; left: string; right: string; leftW: number; rightW: number } | null = null;
  private static readonly MIN_COL = 56;

  protected startResize(event: PointerEvent, index: number): void {
    if (!this.resizable()) return;
    const handle = event.currentTarget as HTMLElement;
    const cells = Array.from(handle.closest('[role="row"]')!.querySelectorAll<HTMLElement>(':scope > .head-cell'));
    const cols = this.columns();
    this.widths.set(Object.fromEntries(cols.map((c, i) => [c.key, cells[i].getBoundingClientRect().width])));
    this.drag = { pointerId: event.pointerId, x: event.clientX, left: cols[index].key, right: cols[index + 1].key, leftW: cells[index].getBoundingClientRect().width, rightW: cells[index + 1].getBoundingClientRect().width };
    handle.setPointerCapture(event.pointerId);
    handle.classList.add('active');
    event.preventDefault();
    event.stopPropagation();
  }
  protected moveResize(event: PointerEvent): void {
    const d = this.drag;
    if (!d || d.pointerId !== event.pointerId) return;
    const min = EditableTableComponent.MIN_COL;
    const delta = Math.min(Math.max(event.clientX - d.x, min - d.leftW), d.rightW - min);
    this.widths.update((w) => ({ ...w, [d.left]: d.leftW + delta, [d.right]: d.rightW - delta }));
  }
  protected endResize(event: PointerEvent): void {
    if (this.drag?.pointerId !== event.pointerId) return;
    this.drag = null;
    (event.currentTarget as HTMLElement).classList.remove('active');
  }
  protected templateFor(key: string): TemplateRef<unknown> | null {
    return this.cells().find((cell) => cell.key() === key)?.template ?? null;
  }
  protected text(row: T, col: TableColumn): string {
    const value = (row as Record<string, unknown>)[col.key];
    return value === null || value === undefined ? '' : String(value);
  }
  protected begin(row: T, col: TableColumn): void {
    const value = (row as Record<string, unknown>)[col.key];
    this.draft.set(typeof value === 'number' || typeof value === 'string' ? value : '');
  }
  protected commit(row: T, index: number, col: TableColumn): void {
    const raw = this.draft();
    const value = col.edit === 'number' ? Number(raw) || 0 : String(raw);
    if (value === (row as Record<string, unknown>)[col.key]) return;
    this.cellSave.emit({ row, index, key: col.key, value });
  }
}
