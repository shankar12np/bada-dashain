import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { ToastService } from '../../core/ui/toast.service';
import { getDay } from '../../data/festival-days';
import { fillGreeting, greetingsForDay } from '../../data/greetings';
import { getTemplate, templatesForDay } from '../../data/templates';
import { DEFAULT_TRANSFORM, type Card, type CardDesign, type CardText, type PhotoTransform } from '../../models/card.model';
import { isDayId, type DayId, type Greeting, type Lang } from '../../models/festival.model';
import { CardRepository } from '../cards/card.repository';
import { CardRenderService, type LoadedPhoto } from '../render/card-render.service';
import type { CardScene } from '../render/card-scene';
import { TemplatePicker } from './template-picker';

type Tab = 'design' | 'photo' | 'text';

/** Text colours that work on every template (null = template default). */
const SWATCHES: (string | null)[] = [null, '#F7D88B', '#FFFFFF', '#8E0E1A', '#1F1410', '#F59E0B', '#4D7C0F'];

/**
 * `/create/:dayId?template=…&remix=…` — the card editor.
 *
 * State is plain signals; `design` is derived from them and pushed into the
 * Konva scene by an effect. The scene reports gestures (drag / pinch / text
 * drag) back through callbacks, closing the loop.
 */
@Component({
  selector: 'app-editor-page',
  imports: [FormsModule, RouterLink, TemplatePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editor.page.html',
})
export class EditorPage {
  // Route inputs (enabled by withComponentInputBinding()).
  readonly dayId = input<string>();
  readonly template = input<string>();
  readonly remix = input<string>();

  protected readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  private readonly render = inject(CardRenderService);
  private readonly repo = inject(CardRepository);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly stageHost = viewChild.required<ElementRef<HTMLDivElement>>('stageHost');
  private readonly stageWrap = viewChild.required<ElementRef<HTMLDivElement>>('stageWrap');

  // ── editor state ────────────────────────────────────────────────────────
  protected readonly day = computed<DayId>(() => {
    const id = this.remixSource()?.dayId ?? this.dayId();
    return isDayId(id) ? id : 'dashain';
  });
  protected readonly dayInfo = computed(() => getDay(this.day()));
  protected readonly tab = signal<Tab>('photo');
  protected readonly templateId = signal<string>('rajdarbar');
  protected readonly cardLang = signal<Lang>(this.i18n.lang());
  protected readonly greetingId = signal<string | null>(null);
  protected readonly text = signal<CardText>({ greeting: '', subline: null, from: null, lang: this.i18n.lang() });
  protected readonly photo = signal<LoadedPhoto | null>(null);
  protected readonly transform = signal<PhotoTransform>(DEFAULT_TRANSFORM);
  protected readonly isPublic = signal(true);
  protected readonly saving = signal(false);
  protected readonly loadingPhoto = signal(false);
  protected readonly sceneReady = signal(false);
  protected readonly remixSource = signal<Card | null>(null);

  protected readonly suggestions = computed(() => greetingsForDay(this.day()));
  protected readonly swatches = SWATCHES;
  protected readonly templateDefaultColor = computed(() => getTemplate(this.templateId()).text.greeting.color ?? '#000');

  protected readonly design = computed<CardDesign>(() => {
    const p = this.photo();
    return {
      templateId: this.templateId(),
      dayId: this.day(),
      text: this.text(),
      photo: p?.canvas ?? null,
      photoSize: p ? { width: p.width, height: p.height } : undefined,
      transform: this.transform(),
    };
  });

  private scene: CardScene | null = null;
  private initializedFor: DayId | null = null;

  constructor() {
    // Initial template / greeting / remix source from the route.
    effect(() => {
      const day = this.day();
      const tpl = this.template();
      const remixId = this.remix();
      untracked(() => {
        if (remixId && this.remixSource()?.id !== remixId) {
          void this.loadRemix(remixId);
          return;
        }
        if (!this.remixSource() && this.initializedFor !== day) {
          // Fresh card (or the user switched day): day-appropriate defaults.
          this.initializedFor = day;
          const fits = templatesForDay(day);
          this.templateId.set(tpl && getTemplate(tpl).id === tpl ? tpl : fits[0].id);
          this.applyGreeting(this.suggestions()[0]);
        }
      });
    });

    // Push design changes into the canvas.
    effect(() => {
      const d = this.design();
      if (this.sceneReady()) void this.scene!.setDesign(d);
    });

    effect(() => {
      const name = this.i18n.pick(this.dayInfo().name);
      untracked(() =>
        this.seo.set({ title: `${name} — ${this.i18n.t('editor.title')}`, description: this.i18n.t('home.lead'), path: `/create/${this.day()}` }),
      );
    });

    afterNextRender(() => void this.initScene());
    this.destroyRef.onDestroy(() => this.scene?.destroy());
  }

  // ── scene lifecycle ─────────────────────────────────────────────────────
  private async initScene(): Promise<void> {
    const wrap = this.stageWrap().nativeElement;
    this.scene = await this.render.createScene(
      this.stageHost().nativeElement,
      this.design(),
      { interactive: true, displayWidth: wrap.clientWidth || 360 },
      {
        onTransform: (t) => this.transform.set(t),
        onTextOffset: (y) => this.text.update((tx) => ({ ...tx, offsetY: y })),
      },
    );
    this.sceneReady.set(true);
    // Keep the canvas sized to its container (rotation, resize, split-screen).
    const ro = new ResizeObserver(() => this.scene?.resize(wrap.clientWidth));
    ro.observe(wrap);
    this.destroyRef.onDestroy(() => ro.disconnect());
  }

  // ── remix ("Make it mine") ──────────────────────────────────────────────
  private async loadRemix(id: string): Promise<void> {
    try {
      const card = await this.repo.get(id);
      if (!card) {
        this.toast.error(this.i18n.t('viewer.notFound'));
        return;
      }
      this.remixSource.set(card);
      this.templateId.set(card.templateId);
      this.cardLang.set(card.text.lang);
      // Keep their greeting & blessing; the sender line is personal, so clear it.
      this.text.set({ ...card.text, from: null });
      this.greetingId.set(null);
      this.tab.set('photo');
    } catch {
      this.toast.error(this.i18n.t('error.generic'));
    }
  }

  // ── photo ───────────────────────────────────────────────────────────────
  protected async onFile(ev: Event): Promise<void> {
    const inputEl = ev.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = ''; // allow picking the same file again
    if (!file) return;
    this.loadingPhoto.set(true);
    try {
      this.photo.set(await this.render.loadPhoto(file));
      this.transform.set(DEFAULT_TRANSFORM);
    } catch (e) {
      this.toast.error(this.i18n.t((e as Error).message === 'photo-too-big' ? 'editor.photoTooBig' : 'editor.photoError'));
    } finally {
      this.loadingPhoto.set(false);
    }
  }

  protected setZoom(value: number): void {
    this.transform.update((t) => ({ ...t, scale: value }));
  }

  protected rotate(): void {
    this.transform.update((t) => ({ ...t, rotation: (t.rotation + 90) % 360 }));
  }

  protected resetPhoto(): void {
    this.transform.set(DEFAULT_TRANSFORM);
  }

  // ── text ────────────────────────────────────────────────────────────────
  protected applyGreeting(g: Greeting): void {
    const lang = this.cardLang();
    this.greetingId.set(g.id);
    this.text.update((t) => ({
      ...t,
      lang,
      greeting: fillGreeting(g.greeting[lang], lang),
      subline: g.subline ? fillGreeting(g.subline[lang], lang) : null,
    }));
  }

  protected setCardLang(lang: Lang): void {
    this.cardLang.set(lang);
    const g = this.suggestions().find((s) => s.id === this.greetingId());
    if (g) this.applyGreeting(g);
    else this.text.update((t) => ({ ...t, lang }));
  }

  protected patchText(patch: Partial<CardText>): void {
    if ('greeting' in patch || 'subline' in patch) this.greetingId.set(null);
    this.text.update((t) => ({ ...t, ...patch }));
  }

  protected suggestionLabel(g: Greeting): string {
    return fillGreeting(g.greeting[this.cardLang()], this.cardLang());
  }

  // ── output ──────────────────────────────────────────────────────────────
  protected async download(): Promise<void> {
    if (!this.scene) return;
    await this.render.downloadPng(this.scene, `tika-${this.day()}.png`);
  }

  protected async save(): Promise<void> {
    if (!this.scene || this.saving()) return;
    if (!this.photo()) {
      this.toast.show(this.i18n.t('editor.noPhoto'));
      this.tab.set('photo');
      return;
    }
    this.saving.set(true);
    try {
      const user = await this.auth.ensureUser();
      const images = await this.render.exportAll(this.scene);
      const source = this.remixSource();
      const cardId = this.repo.newId();
      await this.repo.publish({
        cardId,
        uid: user.uid,
        ownerName: user.displayName ?? (this.text().from || null),
        dayId: this.day(),
        templateId: this.templateId(),
        text: this.text(),
        visibility: this.isPublic() ? 'public' : 'unlisted',
        remixOf: source?.id ?? null,
        rootId: source ? (source.rootId ?? source.id) : null,
        images,
      });
      await this.router.navigate(['/c', cardId], { queryParams: { new: 1 } });
    } catch (e) {
      console.error('[editor] save failed', e);
      this.toast.error(this.i18n.t('editor.saveError'));
    } finally {
      this.saving.set(false);
    }
  }
}
