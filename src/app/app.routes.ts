import { Routes } from '@angular/router';

/**
 * Every page is lazy-loaded, so the initial bundle is just the shell + auth.
 * Konva (≈ 150 KB) is only downloaded when someone opens the editor,
 * Firestore only when cards are actually listed or loaded.
 */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage) },
  { path: 'create', loadComponent: () => import('./features/days/choose-day.page').then((m) => m.ChooseDayPage) },
  { path: 'create/:dayId', loadComponent: () => import('./features/editor/editor.page').then((m) => m.EditorPage) },
  { path: 'c/:id', loadComponent: () => import('./features/viewer/viewer.page').then((m) => m.ViewerPage) },
  // No public gallery (privacy) — old gallery links go to the home page.
  { path: 'gallery', redirectTo: '' },
  { path: 'gallery/:dayId', redirectTo: '' },
  { path: 'me', loadComponent: () => import('./features/my-cards/my-cards.page').then((m) => m.MyCardsPage) },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage) },
];
