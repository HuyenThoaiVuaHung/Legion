import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon],
  template: `
    <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
    <p class="mat-title-large !m-0">{{ title() }}</p>
    @if (hint()) { <p class="mat-body-medium !m-0 max-w-sm text-[var(--mat-sys-on-surface-variant)]">{{ hint() }}</p> }
    <ng-content />
  `,
  styles: `
    :host {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      padding: 3rem 1rem;
    }
    .empty-icon { width: 4rem; height: 4rem; font-size: 4rem; color: var(--mat-sys-on-surface); }
  `,
})
export class EmptyStateComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly hint = input('');
}
