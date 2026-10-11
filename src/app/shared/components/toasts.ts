import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-card"
             [class]="t.kind === 'error' ? 'bg-sindoor text-cream' : t.kind === 'success' ? 'bg-jamara text-cream' : 'bg-ink text-cream'"
             role="status">
          <span>{{ t.message }}</span>
          <button type="button" (click)="toast.dismiss(t.id)" class="ml-auto opacity-70 hover:opacity-100" aria-label="Dismiss">✕</button>
        </div>
      }
    </div>
  `,
})
export class Toasts {
  protected readonly toast = inject(ToastService);
}
