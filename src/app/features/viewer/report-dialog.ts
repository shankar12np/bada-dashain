import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { TKey } from '../../core/i18n/translations';
import { ToastService } from '../../core/ui/toast.service';
import { CardRepository, type ReportReason } from '../cards/card.repository';

/**
 * Report button + native <dialog>. Reports are write-only for users;
 * the `onReport` Cloud Function counts them and auto-hides at a threshold.
 */
@Component({
  selector: 'app-report-dialog',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" (click)="open()" class="text-sm text-ink-soft underline-offset-4 hover:text-sindoor hover:underline">
      ⚑ {{ i18n.t('viewer.report') }}
    </button>

    <dialog #dlg class="m-auto w-[min(92vw,28rem)] rounded-2xl bg-paper p-0 text-ink shadow-card backdrop:bg-ink/50">
      <form method="dialog" class="p-6" (submit)="$event.preventDefault(); send()">
        <h2 class="heading mb-4 text-2xl text-sindoor">{{ i18n.t('report.title') }}</h2>
        <fieldset class="space-y-2">
          @for (r of reasons; track r) {
            <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-gold/40 px-4 py-2.5 hover:bg-cream">
              <input type="radio" name="reason" class="accent-sindoor" [value]="r" [ngModel]="reason()" (ngModelChange)="reason.set($event)" />
              {{ i18n.t(key(r)) }}
            </label>
          }
        </fieldset>
        <label class="mt-4 block">
          <span class="label">{{ i18n.t('report.note') }}</span>
          <textarea class="field" rows="2" maxlength="300" name="note" [ngModel]="note()" (ngModelChange)="note.set($event)"></textarea>
        </label>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="btn-ghost" (click)="dlg.close()">{{ i18n.t('common.cancel') }}</button>
          <button type="submit" class="btn-primary" [disabled]="sending()">{{ i18n.t('report.send') }}</button>
        </div>
      </form>
    </dialog>
  `,
})
export class ReportDialog {
  readonly cardId = input.required<string>();
  protected readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  private readonly repo = inject(CardRepository);
  private readonly toast = inject(ToastService);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  protected readonly reasons: ReportReason[] = ['inappropriate', 'disrespectful', 'copyright', 'spam', 'other'];
  protected readonly reason = signal<ReportReason>('inappropriate');
  protected readonly note = signal('');
  protected readonly sending = signal(false);

  protected key(r: ReportReason): TKey {
    return `report.${r}` as TKey;
  }

  protected open(): void {
    this.dlg().nativeElement.showModal();
  }

  protected async send(): Promise<void> {
    this.sending.set(true);
    try {
      const user = await this.auth.ensureUser();
      await this.repo.report(this.cardId(), user.uid, this.reason(), this.note());
      this.toast.success(this.i18n.t('report.thanks'));
    } catch (e) {
      // A second report by the same user is rejected by the rules — that's fine.
      if ((e as { code?: string }).code === 'permission-denied') this.toast.success(this.i18n.t('report.thanks'));
      else this.toast.error(this.i18n.t('error.generic'));
    } finally {
      this.sending.set(false);
      this.dlg().nativeElement.close();
    }
  }
}
